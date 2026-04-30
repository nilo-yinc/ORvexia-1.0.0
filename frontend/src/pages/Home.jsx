import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { workflowApi } from '../lib/api';
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
  Globe,
  Terminal,
  Box,
  LayoutDashboard,
  RefreshCw
} from 'lucide-react';

// --- INDUSTRIAL COMPONENTS ---

const MetricPanel = ({ icon: Icon, label, value, trend, isPositive, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative group p-6 bg-surface-1 border border-white/5 hover:border-accent/40 transition-all duration-500 overflow-hidden"
  >
    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-30 transition-opacity">
      <Icon className="w-12 h-12" />
    </div>
    
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-accent/40" />
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-white/30">{label}</span>
      </div>
      <div className={`font-mono text-[10px] ${isPositive ? 'text-accent-success' : 'text-accent-danger'}`}>
        {isPositive ? '+' : '-'}{trend}
      </div>
    </div>

    <div className="flex items-baseline gap-2">
      <h3 className="text-3xl font-black tracking-tighter text-white font-mono">{value}</h3>
      <div className="w-8 h-[1px] bg-white/10" />
    </div>

    {/* Kinetic Bottom Accent */}
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/5" />
    <div className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-hover:w-full transition-all duration-700" />
  </motion.div>
);

const ActivityRow = ({ title, status, time, type, index }) => (
  <motion.div 
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.3 + index * 0.05 }}
    className="flex items-center justify-between py-4 px-4 border-b border-white/[0.03] last:border-0 hover:bg-white/[0.02] group transition-all"
  >
    <div className="flex items-center gap-6">
      <div className="relative">
        <div className={`w-12 h-12 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:border-accent/30 transition-all`}>
          <Workflow className={`w-5 h-5 ${status === 'success' ? 'text-accent-success' : status === 'failed' ? 'text-accent-danger' : 'text-accent'}`} />
        </div>
        {/* Status Pulse */}
        <div className={`absolute -top-1 -right-1 w-2 h-2 ${status === 'success' ? 'bg-accent-success' : status === 'failed' ? 'bg-accent-danger' : 'bg-accent'} animate-pulse`} />
      </div>
      
      <div>
        <h4 className="text-sm font-bold text-white group-hover:text-accent transition-colors">
          {title}
        </h4>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-white/20">{type}</span>
          <div className="w-1 h-1 bg-white/10" />
          <span className="text-[10px] font-medium text-white/40 italic">{time}</span>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-8">
      <div className="hidden md:block font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
        STATUS_CODE: <span className={status === 'success' ? 'text-accent-success' : 'text-accent-danger'}>{status.toUpperCase()}</span>
      </div>
      <ChevronRight className="w-4 h-4 text-white/10 group-hover:text-accent group-hover:translate-x-1 transition-all" />
    </div>
  </motion.div>
);

const KineticButton = ({ children, primary = false, onClick, className = "" }) => (
  <button
    onClick={onClick}
    className={`
      relative px-6 py-3 font-bold uppercase tracking-widest text-[10px] transition-all duration-300 overflow-hidden group
      ${primary ? 'bg-accent text-white' : 'bg-surface-2 text-white border border-white/5 hover:border-accent/40'}
      ${className}
    `}
  >
    <div className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </div>
    <div className={`absolute top-0 left-0 w-1 h-1 border-t border-l border-white/30 group-hover:border-accent`} />
    <div className={`absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white/30 group-hover:border-accent`} />
  </button>
);

// --- MAIN PAGE ---

export const Home = () => {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = React.useState([]);
  const [user, setUser] = React.useState(null);
  const [health, setHealth] = React.useState({ api: 'Offline', db: 'Offline', workers: 'Syncing' });
  const [stats, setStats] = React.useState([
    { icon: Workflow, label: 'Active Workflows', value: '0', trend: '...', isPositive: true },
    { icon: Play, label: 'Executions', value: '0', trend: '...', isPositive: true },
    { icon: CheckCircle2, label: 'Success Rate', value: '0%', trend: '...', isPositive: true },
    { icon: Zap, label: 'Resource Load', value: '...', trend: '...', isPositive: true },
  ]);
  const [totalWorkflows, setTotalWorkflows] = React.useState(0);

  const handleCreateWorkflow = async () => {
    const plan = user?.subscription?.plan || 'FREE';
    
    // Check exact count from server to prevent bypass on fast clicks
    try {
      const stats = await workflowApi.getStats();
      const currentWorkflows = stats?.totalWorkflows || totalWorkflows || 0;

      if (plan === 'FREE' && currentWorkflows >= 1) {
        alert("Basic plan is limited to 1 workflow. Upgrade to Pro or Elite to create more architectures.");
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        navigate("/#pricing");
        return;
      }
    } catch (error) {
      console.error("Failed to verify subscription limits:", error);
      alert("Could not verify your subscription limits. Please try again.");
      return; // Do not allow bypass if API fails
    }
    
    navigate('/workflows/builder');
  };

  const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
  };

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [executions, statsData, meResponse, healthRes] = await Promise.all([
          workflowApi.getGlobalExecutions(5),
          workflowApi.getStats(),
          api.get('/v1/auth/me').catch(() => ({ data: { user: null } })),
          api.get('/health').catch(() => ({ data: { ok: false } }))
        ]);

        if (meResponse.data?.user) {
          setUser(meResponse.data.user);
        }

        if (healthRes.data?.ok) {
          setHealth({ api: 'Healthy', db: 'Healthy', workers: 'Active' });
        } else {
          setHealth({ api: 'Offline', db: 'Offline', workers: 'Disabled' });
        }

        if (Array.isArray(executions)) {
          setRecentActivity(executions.map(ex => ({
            title: ex.workflow_id?.name || 'Automated Workflow',
            status: ex.status.toLowerCase(),
            time: timeAgo(ex.startedAt),
            type: 'TELEMETRY'
          })));
        }

        if (statsData) {
          setTotalWorkflows(statsData.totalWorkflows || 0);
          setStats([
            { 
              icon: Workflow, 
              label: 'Active Workflows', 
              value: statsData.activeWorkflows.toString(), 
              trend: 'LIVE', 
              isPositive: true 
            },
            { 
              icon: Play, 
              label: 'Executions', 
              value: statsData.totalExecutions.toString(), 
              trend: 'TOTAL', 
              isPositive: true 
            },
            { 
              icon: CheckCircle2, 
              label: 'Success Rate', 
              value: statsData.successRate, 
              trend: 'AVG', 
              isPositive: true 
            },
            { 
              icon: Zap, 
              label: 'Resource Load', 
              value: statsData.resourceLoad, 
              trend: 'HEALTH', 
              isPositive: true 
            },
          ]);
        }
      } catch (error) {
        console.error("Dashboard fetch failed:", error);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans selection:bg-accent selection:text-white p-8">
      <div className="max-w-7xl mx-auto space-y-12">

        {/* --- GRID BACKGROUND OVERLAY (Subtle) --- */}
        <div className="fixed inset-0 z-0 opacity-10 pointer-events-none surface-dot-grid" />

        {/* Header Section */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="px-2 py-1 bg-accent/10 border border-accent/30 text-[9px] font-mono text-accent uppercase tracking-widest">
                Identity: {user?.name?.toUpperCase() || 'SYSTEM_GUEST'}
              </div>
              <div className="w-8 h-[1px] bg-white/10" />
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              SYSTEM <span className="text-accent italic">DASHBOARD</span>
            </h1>
            <p className="text-white/40 mt-4 text-sm font-medium tracking-tight">
              Real-time telemetry and execution logs for current agentic architectures.
            </p>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex flex-col items-end">
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Infrastructure Health</span>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-1 h-3 ${i < 4 ? 'bg-accent-success' : 'bg-accent-success/20'}`} />
                  ))}
                </div>
                <span className="text-[10px] font-black text-accent-success uppercase">Optimal</span>
              </div>
            </div>
            <KineticButton primary onClick={handleCreateWorkflow}>
              <Plus className="w-4 h-4" /> New Architecture
            </KineticButton>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 border-l border-t border-white/[0.03]">
          {stats.map((stat, idx) => (
            <MetricPanel key={idx} index={idx} {...stat} />
          ))}
        </div>

        {/* Main Dashboard Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Recent Activity Feed */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface-1 border border-white/[0.05] overflow-hidden">
              <div className="p-8 border-b border-white/[0.03] flex items-center justify-between bg-white/[0.01]">
                <div>
                  <h2 className="text-lg font-black tracking-tighter uppercase">Execution Logs</h2>
                  <p className="text-[10px] font-mono text-white/30 mt-1 uppercase tracking-widest">Global Telemetry // Live Stream</p>
                </div>
                <button className="text-[10px] font-bold text-accent hover:text-accent-dim transition-colors uppercase tracking-[0.2em]">
                  Dump Logs
                </button>
              </div>
              <div className="p-2">
                {recentActivity.map((activity, idx) => (
                  <ActivityRow key={idx} index={idx} {...activity} />
                ))}
              </div>
              {/* Bottom Filler */}
              <div className="p-6 bg-white/[0.01] flex justify-center">
                 <button className="text-[9px] font-black text-white/20 hover:text-white transition-all uppercase tracking-[0.5em]">
                   Load Older Records
                 </button>
              </div>
            </div>

            {/* AI Opportunity Card */}
            <motion.div
              whileHover={{ x: 5 }}
              className="relative p-10 bg-accent group cursor-pointer overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-between gap-12 text-white">
                <div className="max-w-md">
                  <div className="flex items-center gap-3 mb-6">
                    <Terminal className="w-6 h-6" />
                    <span className="text-[10px] font-mono font-black tracking-[0.3em] uppercase">Architecture Suggestion</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tighter mb-4 leading-none uppercase">Scale Agentic Support</h3>
                  <p className="text-white/80 text-sm font-medium leading-relaxed">
                    Based on your active integrations, we can deploy a self-healing AI Support Node to handle 60% of incoming telemetry.
                  </p>
                </div>
                <ArrowRight className="w-12 h-12 opacity-30 group-hover:opacity-100 group-hover:translate-x-4 transition-all duration-500" />
              </div>
              {/* Technical Grid Overlay */}
              <div className="absolute inset-0 opacity-10 pointer-events-none surface-dot-grid" />
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000" />
            </motion.div>
          </div>

          {/* Sidebar / Quick Actions */}
          <div className="space-y-12">

            {/* Subscription Status Card */}
            <div className="bg-surface-1 border border-white/[0.05] overflow-hidden">
               <div className="p-8 border-b border-white/[0.03] bg-white/[0.01]">
                  <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30">Membership Tier</h2>
               </div>
               <div className="p-8 space-y-8">
                  <div className="flex items-center gap-4 p-4 bg-surface-2 border border-white/5 group hover:border-accent/30 transition-all">
                     <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20">
                        <Sparkles className="w-6 h-6 text-accent" />
                     </div>
                     <div>
                        <p className="text-lg font-black text-white uppercase tracking-tighter">{user?.subscription?.plan || 'BASIC'}</p>
                        <p className="text-[10px] font-mono text-white/40 uppercase">System Class: {user?.subscription?.status || 'UNRANKED'}</p>
                     </div>
                  </div>

                  <div className="space-y-4">
                     <div className="flex justify-between text-[10px] font-mono text-white/40 uppercase tracking-widest">
                        <span>Trial Lifecycle</span>
                        <span className="text-white">{(() => {
                           if (!user?.subscription?.expiryDate) return 'LIFETIME';
                           const diff = new Date(user.subscription.expiryDate) - new Date();
                           const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
                           return days > 0 ? `${days} DAYS LEFT` : 'EXPIRED';
                        })()}</span>
                     </div>
                     <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: user?.subscription?.plan !== 'FREE' ? '70%' : '100%' }}
                          className="h-full bg-accent" 
                        />
                     </div>
                  </div>

                  <button 
                    onClick={() => navigate('/#pricing')}
                    className="w-full py-4 bg-white/5 border border-white/10 text-[10px] font-black text-white hover:bg-accent hover:text-white hover:border-accent transition-all uppercase tracking-[0.3em]"
                  >
                    Manage Infrastructure
                  </button>
               </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="bg-surface-1 border border-white/[0.05] p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-8">Quick Protocols</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: LayoutDashboard, label: 'Interfaces', path: '/interfaces' },
                  { icon: RefreshCw, label: 'Transfer', path: '/transfer' },
                  { icon: Database, label: 'Data Tables', path: '/tables' },
                  { icon: Settings, label: 'Config', path: '/settings' },
                ].map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center justify-center aspect-square bg-surface-2 border border-white/5 hover:border-accent/40 transition-all group"
                  >
                    <action.icon className="w-6 h-6 mb-4 text-white/40 group-hover:text-accent group-hover:scale-110 transition-all" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/30 group-hover:text-white">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Health Indicators */}
            <div className="bg-surface-1 border border-white/[0.05] p-8">
              <h2 className="text-xs font-black uppercase tracking-[0.4em] text-white/30 mb-8">Network Nodes</h2>
              <div className="space-y-6">
                {[
                  { label: 'API Gateway', status: health.api, icon: Globe },
                  { label: 'Worker Clusters', status: health.workers, icon: Cpu },
                  { label: 'Core Database', status: health.db, icon: Database },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-surface-2 border border-white/5 group-hover:border-accent/20 transition-all">
                        <item.icon className="w-4 h-4 text-white/40 group-hover:text-white" />
                      </div>
                      <span className="text-xs font-bold text-white/60 group-hover:text-white transition-colors">{item.label}</span>
                    </div>
                    <span className={`text-[9px] font-mono uppercase tracking-widest ${item.status === 'Healthy' || item.status === 'Active' ? 'text-accent-success' : 'text-accent'}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Help / Docs Card */}
            <div className="relative p-8 bg-surface-2 border border-white/5 overflow-hidden group">
              <div className="relative z-10">
                <h3 className="text-lg font-black tracking-tighter uppercase mb-2">Protocol Docs</h3>
                <p className="text-white/40 text-xs font-medium mb-6 leading-relaxed">System documentation for deep infrastructure integration.</p>
                <KineticButton className="w-full">
                  Access Manual
                </KineticButton>
              </div>
              {/* Decorative Accent */}
              <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 -rotate-45 translate-x-8 -translate-y-8" />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
