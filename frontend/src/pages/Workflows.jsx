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
  Terminal,
  Activity,
  Cpu,
  Layers,
  Share2,
  Box,
  Settings
} from "lucide-react";
import { workflowApi } from "../lib/api";

const ArchitectureBlueprint = ({ workflow, index, onClick }) => {
  const statusColors = {
    active: 'text-accent-success bg-accent-success/5 border-accent-success/20',
    paused: 'text-accent bg-accent/5 border-accent/20',
    error: 'text-accent-danger bg-accent-danger/5 border-accent-danger/20',
  };

  const status = workflow.status || 'active';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      className="group relative bg-surface-1 border border-white/[0.05] hover:border-accent/40 transition-all duration-500 cursor-pointer overflow-hidden"
    >
      {/* Blueprint Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none surface-dot-grid" />
      
      {/* Schematic Visual */}
      <div className="h-40 bg-surface-2 relative overflow-hidden flex items-center justify-center p-8 border-b border-white/[0.03]">
        <div className="relative w-full h-full border border-white/[0.05] flex items-center justify-center">
           {/* Abstract Node Structure SVG */}
           <svg viewBox="0 0 200 100" className="w-full h-full text-white/5 transition-transform duration-700 group-hover:scale-110">
              <path d="M40 50 L80 50 M120 50 L160 50" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
              <rect x="25" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="85" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1" />
              <rect x="145" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1" />
              {/* Active Pulse on line */}
              <circle r="2" fill="#FF5F1F" className="animate-pulse">
                <animateMotion dur="3s" repeatCount="indefinite" path="M40 50 L160 50" />
              </circle>
           </svg>
        </div>
        
        {/* Status Tag */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
           <div className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest border ${statusColors[status]}`}>
             {status}
           </div>
        </div>
        
        {/* Version Tag */}
        <div className="absolute top-4 right-4 text-[8px] font-mono text-white/10 uppercase tracking-widest">
           v4.2.0_STABLE
        </div>
      </div>

      {/* Blueprint Info */}
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:border-accent/30 transition-all">
             <Cpu className="w-4 h-4 text-white/40 group-hover:text-accent" />
          </div>
          <h3 className="text-sm font-black text-white group-hover:text-accent transition-colors uppercase tracking-widest truncate">
            {workflow.name.toUpperCase()}
          </h3>
        </div>

        <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest leading-relaxed line-clamp-2 mb-6">
          {workflow.description}
        </p>

        {/* Telemetry Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
          <div className="flex flex-col">
             <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Total_Ops</span>
             <span className="text-[11px] font-black text-white/60 group-hover:text-white transition-colors">{workflow.executions || 0}</span>
          </div>
          <div className="flex flex-col items-end">
             <span className="text-[8px] font-mono text-white/10 uppercase tracking-widest">Efficiency</span>
             <span className="text-[11px] font-black text-accent-success">{workflow.successRate || 0}%</span>
          </div>
        </div>
      </div>

      {/* Kinetic Accent */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/[0.02]" />
      <div className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-hover:w-full transition-all duration-700" />
    </motion.div>
  );
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian text-white/20">
        <div className="w-12 h-12 border border-accent/20 border-t-accent rounded-full animate-spin mb-4" />
        <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Syncing_Database...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian p-8 space-y-12">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header - Industrial Command Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Architecture_Modules // Archive_01</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              SYSTEM <span className="text-accent italic">ARCHITECTURES</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input
                type="text"
                placeholder="SEARCH_BLUEPRINTS..."
                className="bg-surface-2 border border-white/5 pl-9 pr-4 py-2 w-64 text-[10px] font-mono text-white placeholder-white/10 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
              />
            </div>
            <button
              onClick={() => navigate("/workflows/builder")}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Plus className="w-4 h-4" /> New_Architecture
            </button>
          </div>
        </div>

        {/* Stats Summary Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-white/[0.03] relative z-10">
          {[
            { label: "Active_Architectures", value: workflows.length },
            { label: "Draft_Modules", value: "00" },
            { label: "Global_Efficiency", value: "96.2%" },
          ].map((stat, idx) => (
            <div key={idx} className="p-8 bg-surface-1 border-r border-b border-white/[0.03] group hover:bg-white/[0.01] transition-all cursor-pointer">
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] mb-4">
                {stat.label}
              </p>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-black font-mono text-white tracking-tighter">
                  {stat.value}
                </p>
                <div className="w-1.5 h-1.5 bg-accent/20" />
              </div>
            </div>
          ))}
        </div>

        {/* Architectures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {workflows.map((workflow, idx) => (
            <ArchitectureBlueprint 
              key={workflow._id || workflow.id || idx}
              workflow={workflow}
              index={idx}
              onClick={() => navigate(`/workflows/builder/${workflow._id || workflow.id}`)}
            />
          ))}
          
          {/* Empty Slot / Create New */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: workflows.length * 0.1 }}
            onClick={() => navigate("/workflows/builder")}
            className="group relative bg-surface-1 border border-white/[0.03] border-dashed flex flex-col items-center justify-center p-12 cursor-pointer hover:border-accent/40 transition-all duration-500"
          >
             <div className="w-12 h-12 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:bg-accent/10 transition-all mb-4">
                <Plus className="w-6 h-6 text-white/10 group-hover:text-accent" />
             </div>
             <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white">Initialize_New_Module</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
