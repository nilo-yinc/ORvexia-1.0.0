import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Database, ArrowRight, Clock, CheckCircle2, 
  AlertCircle, Play, Search, Filter, 
  ChevronRight, RefreshCw, Layers
} from 'lucide-react';

const TransferRecord = ({ source, target, status, date, records }) => (
  <div className="group flex items-center justify-between p-4 bg-surface-1 border border-white/5 hover:border-accent/40 transition-all cursor-pointer">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:bg-accent/10 transition-colors">
          <Database className="w-4 h-4 text-white/30 group-hover:text-accent" />
        </div>
        <div>
          <p className="text-[10px] font-black text-white uppercase tracking-widest">{source} → {target}</p>
          <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mt-1">{records} Records moved</p>
        </div>
      </div>
    </div>

    <div className="flex items-center gap-8">
      <div className="text-right">
        <p className={`text-[9px] font-black uppercase tracking-[0.2em] ${status === 'COMPLETED' ? 'text-accent' : 'text-yellow-500'}`}>
          {status}
        </p>
        <p className="text-[8px] font-mono text-white/10 uppercase tracking-widest mt-1">{date}</p>
      </div>
      <button className="p-2 text-white/10 group-hover:text-white transition-colors">
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  </div>
);

export const Transfer = () => {
  const [activeTab, setActiveTab] = useState('TRANSFERS');

  return (
    <div className="min-h-screen bg-obsidian p-8">
      <div className="max-w-[1200px] mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Bulk_Movement // Migration_Engine</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              ORVEXIA <span className="text-accent italic">TRANSFER</span>
            </h1>
          </div>
          <button className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all">
            <Plus className="w-4 h-4" /> New_Transfer_Run
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-l border-t border-white/[0.03]">
          {[
            { label: 'Total Records Moved', value: '1.2M+' },
            { label: 'Active Runs', value: '03' },
            { label: 'Scheduled Jobs', value: '12' },
            { label: 'System Health', value: '99.9%' }
          ].map((stat, i) => (
            <div key={stat.label} className="p-6 bg-surface-1 border-r border-b border-white/[0.03]">
              <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="text" 
              placeholder="SEARCH_TRANSFERS..."
              className="w-full bg-surface-1 border border-white/5 pl-12 pr-4 py-3 text-[10px] font-mono text-white focus:outline-none focus:border-accent/40"
            />
          </div>
          <button className="px-6 py-3 border border-white/5 text-[10px] font-black text-white/40 uppercase tracking-widest hover:text-white transition-all">
            Filter_By_Service
          </button>
        </div>

        {/* List */}
        <div className="space-y-1">
          <TransferRecord 
            source="Stripe" 
            target="PostgreSQL" 
            status="COMPLETED" 
            date="2024-04-26 14:20" 
            records="45,200" 
          />
          <TransferRecord 
            source="Shopify" 
            target="ORvexia Tables" 
            status="RUNNING" 
            date="2024-04-26 16:00" 
            records="128,041" 
          />
          <TransferRecord 
            source="Mailchimp" 
            target="Salesforce" 
            status="COMPLETED" 
            date="2024-04-25 09:12" 
            records="8,402" 
          />
        </div>
      </div>
    </div>
  );
};

const Plus = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);
