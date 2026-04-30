import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Plus, Play, Pause, Edit, Trash2, MoreVertical, Clock,
  Search, Terminal, Activity, Cpu, Layers, Share2, Box,
  Settings, Zap, GitBranch, CheckCircle, XCircle, Loader2,
  ChevronDown, ToggleLeft, ToggleRight
} from "lucide-react";
import { workflowApi, blueprintApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import BlueprintGallery from "../components/blueprints/BlueprintGallery";

// App color map for visual previews
const appColors = {
  Gmail: '#EA4335', Slack: '#4A154B', GitHub: '#181717', Notion: '#000000',
  'Google Drive': '#4285F4', Discord: '#5865F2', Stripe: '#635BFF',
  HubSpot: '#FF7A59', Calendly: '#006BFF', Webhook: '#FF5F1F',
  Start: '#FF5F1F', 'HTTP Request': '#FF5F1F', 'AI Agent': '#FF5F1F',
};

const WorkflowCard = ({ workflow, index, onClick, onDelete, onToggle, onShare }) => {
  const [showMenu, setShowMenu] = useState(false);
  const status = workflow.status || (workflow.is_active ? 'active' : 'paused');
  const nodeLabels = (workflow.nodes || []).map(n => n.data?.label).filter(Boolean);
  const appChain = nodeLabels.length > 0 ? nodeLabels : ['Start'];

  const statusConfig = {
    active: { color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', icon: CheckCircle, label: 'ACTIVE' },
    draft: { color: 'text-amber-400 bg-amber-500/10 border-amber-500/20', icon: Edit, label: 'DRAFT' },
    paused: { color: 'text-white/40 bg-white/5 border-white/10', icon: Pause, label: 'PAUSED' },
    error: { color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: XCircle, label: 'ERROR' },
  };

  const cfg = statusConfig[status] || statusConfig.draft;
  const StatusIcon = cfg.icon;

  const timeSince = (date) => {
    if (!date) return 'never';
    const s = Math.floor((Date.now() - new Date(date)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="group relative bg-surface-1 border border-white/[0.05] hover:border-accent/40 transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* Flow Preview */}
      <div onClick={onClick} className="h-36 bg-surface-2 relative overflow-hidden flex items-center justify-center p-6 border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          {appChain.slice(0, 4).map((app, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center border border-white/10 bg-surface-1 text-[9px] font-black uppercase tracking-wider text-white/50 group-hover:border-accent/30 transition-all"
                style={{ borderLeftColor: appColors[app] || '#FF5F1F', borderLeftWidth: '3px' }}
              >
                {app.slice(0, 2)}
              </div>
              {i < Math.min(appChain.length, 4) - 1 && (
                <div className="flex items-center">
                  <div className="w-6 h-[1px] bg-white/10" />
                  <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-transparent border-l-white/10" />
                </div>
              )}
            </div>
          ))}
          {appChain.length > 4 && (
            <span className="text-[9px] text-white/20 font-mono">+{appChain.length - 4}</span>
          )}
        </div>

        {/* Status Badge */}
        <div className="absolute top-3 left-3">
          <div className={`flex items-center gap-1.5 px-2 py-1 text-[8px] font-black uppercase tracking-widest border ${cfg.color}`}>
            <StatusIcon className="w-2.5 h-2.5" />
            {cfg.label}
          </div>
        </div>

        {/* More Menu */}
        <div className="absolute top-3 right-3">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className="p-1.5 text-white/10 hover:text-white/50 transition-colors"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute right-0 top-8 bg-surface-1 border border-white/10 shadow-2xl z-50 min-w-[140px]"
              >
                <button onClick={(e) => { e.stopPropagation(); onClick(); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-white/60 hover:bg-white/5 uppercase tracking-wider">
                  <Edit className="w-3 h-3" /> Edit
                </button>
                <button onClick={(e) => { e.stopPropagation(); onToggle(workflow._id, !workflow.is_active); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-white/60 hover:bg-white/5 uppercase tracking-wider">
                  {workflow.is_active ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  {workflow.is_active ? 'Pause' : 'Activate'}
                </button>
                <div className="h-[1px] bg-white/5" />
                <button onClick={(e) => { e.stopPropagation(); onShare(workflow); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-accent/80 hover:bg-accent/10 uppercase tracking-wider">
                  <Share2 className="w-3 h-3" /> Add as Template
                </button>
                <div className="h-[1px] bg-white/5" />
                <button onClick={(e) => { e.stopPropagation(); onDelete(workflow._id); setShowMenu(false); }} className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold text-red-400/80 hover:bg-red-500/10 uppercase tracking-wider">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info */}
      <div onClick={onClick} className="p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-7 h-7 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:border-accent/30 transition-all">
            <Cpu className="w-3.5 h-3.5 text-white/40 group-hover:text-accent" />
          </div>
          <h3 className="text-[11px] font-black text-white group-hover:text-accent transition-colors uppercase tracking-widest truncate flex-1">
            {(workflow.name || 'Untitled').toUpperCase()}
          </h3>
        </div>

        {workflow.description && (
          <p className="text-[10px] text-white/20 font-mono uppercase tracking-widest leading-relaxed line-clamp-2 mb-4">
            {workflow.description}
          </p>
        )}

        {/* Nodes chip row */}
        <div className="flex flex-wrap gap-1 mb-4">
          {nodeLabels.slice(0, 3).map((label, i) => (
            <span key={i} className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-white/30">
              {label}
            </span>
          ))}
          {nodeLabels.length > 3 && (
            <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent/60">
              +{nodeLabels.length - 3} more
            </span>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-white/[0.03]">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-white/15">
            <Clock className="w-3 h-3" />
            {timeSince(workflow.updatedAt)}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); onShare(workflow); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all group/share ${workflow.is_template ? 'border-accent/40 bg-accent/10 text-accent hover:bg-accent/20' : 'border-accent/20 bg-accent/5 text-accent hover:bg-accent/10'}`}
                title={workflow.is_template ? "Remove from Template" : "Add as Template"}
              >
                <Share2 className={`w-2.5 h-2.5 group-hover/share:scale-110 transition-transform ${workflow.is_template ? 'fill-accent' : ''}`} />
                <span className="text-[8px] font-black uppercase tracking-wider">{workflow.is_template ? 'Published' : 'Template'}</span>
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onToggle(workflow._id || workflow.id, !workflow.is_active); }}
                className={`flex items-center gap-1.5 px-3 py-1.5 border transition-all ${workflow.is_active ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400 hover:bg-emerald-500/10' : 'border-white/10 bg-white/5 text-white/30 hover:bg-white/10'}`}
                title={workflow.is_active ? "Pause Workflow" : "Activate Workflow"}
              >
                {workflow.is_active ? <Pause className="w-2.5 h-2.5 fill-current" /> : <Play className="w-2.5 h-2.5 fill-current" />}
                <span className="text-[8px] font-black uppercase tracking-wider">{workflow.is_active ? 'Active' : 'Paused'}</span>
              </button>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[8px] font-mono text-white/10 uppercase">Runs</span>
              <span className="text-[10px] font-black text-white/50">{workflow.executions || workflow.stats?.total_runs || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom accent line */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-accent w-0 group-hover:w-full transition-all duration-500" />
    </motion.div>
  );
};

export const Workflows = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('workflows'); // workflows, library
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, draft

  const handleCreateWorkflow = async (stateData = {}) => {
    const plan = user?.subscription?.plan || 'FREE';
    
    try {
      const stats = await workflowApi.getStats();
      const currentWorkflows = stats?.totalWorkflows || workflows.length || 0;
      
      if (plan === 'FREE' && currentWorkflows >= 1) {
        alert("Basic plan is limited to 1 workflow. Upgrade to Pro or Elite to create more architectures.");
        document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
        navigate("/#pricing");
        return;
      }
    } catch (error) {
      console.error("Failed to verify limits:", error);
      alert("Could not verify your subscription limits. Please try again.");
      return;
    }
    
    localStorage.removeItem("orvexia_workflow_draft_draft");
    localStorage.removeItem("orvexia_copilot_messages_draft");
    navigate("/workflows/builder", { state: stateData });
  };

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const data = await workflowApi.getAll();
      setWorkflows(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch workflows:", err);
      setError("Failed to load workflows");
      setWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this workflow permanently?")) return;
    try {
      await workflowApi.delete(id);
      setWorkflows(prev => prev.filter(w => (w._id || w.id) !== id));
    } catch (err) {
      console.error("Delete failed:", err);
    }
  };

  const handleToggle = async (id, isActive) => {
    try {
      await workflowApi.toggle(id, isActive);
      setWorkflows(prev => prev.map(w =>
        (w._id || w.id) === id
          ? { ...w, is_active: isActive, status: isActive ? 'active' : 'paused' }
          : w
      ));
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const handleShare = async (workflow) => {
    try {
      const updatedWorkflow = await workflowApi.toggleTemplate(workflow._id || workflow.id);
      setWorkflows(prev => prev.map(w => 
        (w._id || w.id) === (workflow._id || workflow.id) 
          ? { ...w, is_template: updatedWorkflow.workflow.is_template }
          : w
      ));
      if (updatedWorkflow.workflow.is_template) {
        alert("TEMPLATE_PUBLISHED: This module is now live in the System Library.");
      } else {
        alert("TEMPLATE_REMOVED: This module was removed from the System Library.");
      }
    } catch (err) {
      console.error("Template toggle failed:", err);
      alert("OPERATION_FAILED: Could not modify template status.");
    }
  };

  const filteredWorkflows = workflows.filter(w => {
    const matchSearch = searchQuery === '' || (w.name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchFilter = filter === 'all'
      || (filter === 'active' && w.is_active)
      || (filter === 'draft' && !w.is_active);
    return matchSearch && matchFilter;
  });

  const activeCount = workflows.filter(w => w.is_active).length;
  const draftCount = workflows.filter(w => !w.is_active).length;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-obsidian text-white/20">
        <Loader2 className="w-8 h-8 animate-spin text-accent mb-4" />
        <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Syncing_Database...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-obsidian p-8 space-y-10">
      <div className="max-w-[1600px] mx-auto space-y-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Automation // Archive</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              MY <span className="text-accent italic">WORKFLOWS</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH WORKFLOWS..."
                className="bg-surface-2 border border-white/5 pl-9 pr-4 py-2.5 w-64 text-[10px] font-mono text-white placeholder-white/10 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
              />
            </div>
            <button
              onClick={() => handleCreateWorkflow()}
              className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Plus className="w-4 h-4" /> Create New Workflow
            </button>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-l border-t border-white/[0.03] relative z-10">
          {[
            { label: "Active Workflows", value: activeCount, accent: true },
            { label: "Drafts", value: draftCount },
            { label: "Total Projects", value: workflows.length },
          ].map((stat, idx) => (
            <div key={idx} className="p-8 bg-surface-1 border-r border-b border-white/[0.03] group hover:bg-white/[0.01] transition-all">
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em] mb-4">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <p className={`text-3xl font-black font-mono tracking-tighter ${stat.accent ? 'text-accent' : 'text-white'}`}>
                  {stat.value}
                </p>
                <div className={`w-1.5 h-1.5 ${stat.accent ? 'bg-accent' : 'bg-white/20'}`} />
              </div>
            </div>
          ))}
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-8 border-b border-white/[0.03]">
          <button
            onClick={() => setActiveTab('workflows')}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'workflows' ? 'text-accent' : 'text-white/20 hover:text-white/40'}`}
          >
            My Modules
            {activeTab === 'workflows' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" />}
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`pb-4 text-[11px] font-black uppercase tracking-[0.4em] transition-all relative ${activeTab === 'library' ? 'text-accent' : 'text-white/20 hover:text-white/40'}`}
          >
            System Library
            {activeTab === 'library' && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 w-full h-[2px] bg-accent" />}
          </button>
        </div>

        {activeTab === 'workflows' ? (
          <>
            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-surface-1 border border-white/[0.05] p-1 w-fit">
              {['all', 'active', 'draft'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all ${
                    filter === f ? 'bg-accent text-white' : 'text-white/30 hover:text-white/60'
                  }`}
                >
                  {f === 'all' ? `All (${workflows.length})` : f === 'active' ? `Active (${activeCount})` : `Drafts (${draftCount})`}
                </button>
              ))}
            </div>

            {/* Workflows Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 relative z-10">
              {filteredWorkflows.map((workflow, idx) => (
                <WorkflowCard
                  key={workflow._id || workflow.id || idx}
                  workflow={workflow}
                  index={idx}
                  onClick={() => navigate(`/workflows/builder/${workflow._id || workflow.id}`)}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                  onShare={handleShare}
                />
              ))}

              {/* Create New Card */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: filteredWorkflows.length * 0.05 }}
                onClick={() => handleCreateWorkflow()}
                className="group relative bg-surface-1 border border-white/[0.03] border-dashed flex flex-col items-center justify-center p-12 cursor-pointer hover:border-accent/40 transition-all duration-300 min-h-[280px]"
              >
                <div className="w-14 h-14 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:bg-accent/10 group-hover:border-accent/30 transition-all mb-5">
                  <Plus className="w-6 h-6 text-white/10 group-hover:text-accent transition-colors" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-white/20 group-hover:text-white transition-colors">
                  Initialize_New_Module
                </span>
                <span className="text-[8px] font-mono text-white/10 mt-2 uppercase tracking-widest">
                  Click to create a new automation
                </span>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="py-10">
            <BlueprintGallery onSelectBlueprint={(bp) => handleCreateWorkflow({ blueprint: bp })} />
          </div>
        )}
 
        {/* Empty State */}
        {workflows.length === 0 && !loading && (
          <div className="text-center py-20">
            <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center bg-surface-1 border border-white/5">
              <Layers className="w-8 h-8 text-white/10" />
            </div>
            <h3 className="text-lg font-black text-white/40 uppercase tracking-widest mb-2">No Workflows Yet</h3>
            <p className="text-[11px] text-white/20 font-mono uppercase tracking-widest mb-8">
              Create your first automation workflow to get started
            </p>
            <button
              onClick={() => handleCreateWorkflow()}
              className="inline-flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              <Zap className="w-4 h-4" /> Create Your First Workflow
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
