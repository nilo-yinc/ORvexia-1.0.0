import { motion } from 'framer-motion';
import { Search, Clock, Users, Terminal, Cpu, Layers, Box, Globe, Share2, Plus, Zap } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const workflowTemplates = [
  { id: 1, title: 'LEAD_GEN_AUTO_SYNC', description: 'Industrial capture and qualification logic for CRM injection.', category: 'Sales', apps: ['AI_LOGIC', 'CRM_LINK', 'MAIL_SYS'], uses: '15.8k', time: '5m', difficulty: 'BETA' },
  { id: 2, title: 'EMAIL_TRIAGE_AGENT', description: 'Categorization and response architecture for high-volume telemetry.', category: 'Productivity', apps: ['MAIL_GATE', 'AI_CORE', 'CAL_SYNC'], uses: '22.4k', time: '4m', difficulty: 'STABLE' },
  { id: 3, title: 'TALENT_PIPELINE_OS', description: 'Recursive applicant tracking system from intake to authorization.', category: 'HR', apps: ['INTAKE_API', 'ATS_STORE', 'COMMS_HUB'], uses: '8.9k', time: '6m', difficulty: 'BETA' },
  { id: 4, title: 'SLACK_CHANGELOG_BOT', description: 'Automated extraction of tool updates into centralized changelog.', category: 'Productivity', apps: ['COMMS_IN', 'DOC_SYNC', 'LOG_STORE'], uses: '6.2k', time: '3m', difficulty: 'STABLE' },
  { id: 5, title: 'OFFLINE_CONV_TRACKER', description: 'Cross-platform conversion tracking with analytics synchronization.', category: 'Marketing', apps: ['ADS_API', 'FB_GATE', 'DATA_STREAM'], uses: '11.7k', time: '5m', difficulty: 'BETA' },
  { id: 6, title: 'SALES_PREP_ENGINE', description: 'Automated intelligence gathering for executive client sessions.', category: 'Sales', apps: ['CRM_LINK', 'CAL_SYNC', 'DOC_ARCH'], uses: '9.5k', time: '4m', difficulty: 'STABLE' },
];

const categories = ['ALL_MODULES', 'SALES', 'PRODUCTIVITY', 'MARKETING', 'HR', 'DEVELOPMENT'];

const BlueprintCard = ({ template, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.05 }}
    onClick={onClick}
    className="group relative bg-surface-1 border border-white/[0.05] hover:border-accent/40 transition-all duration-500 cursor-pointer overflow-hidden"
  >
    {/* Blueprint Grid */}
    <div className="absolute inset-0 opacity-[0.02] pointer-events-none surface-dot-grid" />
    
    {/* Schematic Visual */}
    <div className="h-40 bg-surface-2 relative flex items-center justify-center border-b border-white/[0.03] overflow-hidden">
       <svg viewBox="0 0 200 100" className="w-48 h-24 text-white/5 transition-transform duration-700 group-hover:scale-110">
          <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="1" />
          <rect x="120" y="35" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M65 50 L120 50" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" />
          <path d="M50 35 L50 15 L120 15 L120 35" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
       </svg>
       
       <div className="absolute top-4 left-4 px-2 py-0.5 bg-accent/10 border border-accent/20 text-[8px] font-black text-accent uppercase tracking-widest">
         {template.difficulty}
       </div>
    </div>

    {/* Info Section */}
    <div className="p-6">
       <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:border-accent/30 transition-all">
             <Layers className="w-4 h-4 text-white/20 group-hover:text-accent" />
          </div>
          <h3 className="text-sm font-black text-white group-hover:text-accent transition-colors uppercase tracking-widest truncate">
            {template.title}
          </h3>
       </div>

       <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest leading-relaxed line-clamp-2 mb-6">
         {template.description}
       </p>

       {/* Technical Tags */}
       <div className="flex flex-wrap gap-2 mb-6">
          {template.apps.map((app, i) => (
             <span key={i} className="px-2 py-1 bg-white/[0.02] border border-white/5 text-[8px] font-mono text-white/40 uppercase tracking-widest group-hover:border-white/10 transition-colors">
                {app}
             </span>
          ))}
       </div>

       {/* Telemetry Footer */}
       <div className="flex items-center justify-between pt-4 border-t border-white/[0.03]">
          <div className="flex items-center gap-4">
             <div className="flex flex-col">
                <span className="text-[7px] font-mono text-white/10 uppercase tracking-widest">Deployments</span>
                <span className="text-[10px] font-black text-white/40">{template.uses}</span>
             </div>
             <div className="flex flex-col">
                <span className="text-[7px] font-mono text-white/10 uppercase tracking-widest">Setup_Time</span>
                <span className="text-[10px] font-black text-white/40">{template.time}</span>
             </div>
          </div>
          <button className="p-2 bg-surface-2 border border-white/5 text-white/20 group-hover:text-accent group-hover:border-accent/40 transition-all">
             <Plus className="w-3.5 h-3.5" />
          </button>
       </div>
    </div>

    {/* Kinetic Accent */}
    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/[0.02]" />
    <div className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-hover:w-full transition-all duration-700" />
  </motion.div>
);

export const Templates = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('ALL_MODULES');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalWorkflows, setTotalWorkflows] = useState(0);

  const handleCreateWorkflow = async (stateData = {}) => {
    const plan = user?.subscription?.plan || 'FREE';
    
    // Always check the exact count from the server to prevent bypass
    try {
      const { workflowApi } = await import('../lib/api');
      const stats = await workflowApi.getStats();
      const currentWorkflows = stats?.totalWorkflows || 0;
      
      if (plan === 'FREE' && currentWorkflows >= 1) {
        alert("Basic plan is limited to 1 workflow. Upgrade to Pro or Elite to create more architectures.");
        navigate("/#pricing");
        return;
      }
    } catch (error) {
      console.error("Failed to verify subscription limits:", error);
    }
    
    navigate('/workflows/builder', { state: stateData });
  };

  const filteredTemplates = workflowTemplates.filter(template => {
    const matchesCategory = selectedCategory === 'ALL_MODULES' || template.category.toUpperCase() === selectedCategory;
    const matchesSearch = searchQuery === '' ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-obsidian p-8 space-y-12">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header - Industrial Command Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Resource_Library // Blueprints_v4</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              MODULE <span className="text-accent italic">BLUEPRINTS</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input
                type="text"
                placeholder="SEARCH_LIBRARY..."
                className="bg-surface-2 border border-white/5 pl-9 pr-4 py-2 w-64 text-[10px] font-mono text-white placeholder-white/10 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
              />
            </div>
          </div>
        </div>

        {/* Category Navigation - Industrial Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-white/[0.03]">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap border-b-2
                ${selectedCategory === category
                  ? 'border-accent text-accent'
                  : 'border-transparent text-white/30 hover:text-white hover:bg-white/[0.02]'
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Blueprints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
          {filteredTemplates.map((template, idx) => (
            <BlueprintCard 
              key={template.id}
              template={template}
              index={idx}
              onClick={() => handleCreateWorkflow({ template })}
            />
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-24 border border-dashed border-white/5">
             <Box className="w-12 h-12 text-white/5 mx-auto mb-4" />
             <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">No_Blueprints_Matched_Current_Filter</p>
          </div>
        )}
      </div>
    </div>
  );
};
