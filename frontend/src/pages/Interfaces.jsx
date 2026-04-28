import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, PanelLeft, MousePointer2, Share2, 
  Eye, Settings, Plus, Terminal, Box, 
  MessageSquare, FileText, Globe, Smartphone, Monitor
} from 'lucide-react';

const InterfaceCard = ({ title, type, status, views }) => (
  <div className="group bg-surface-1 border border-white/5 p-6 hover:border-accent/40 transition-all cursor-pointer relative overflow-hidden">
    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-100 transition-opacity">
      <Layout className="w-12 h-12 text-white" />
    </div>
    
    <div className="relative z-10">
      <div className="flex items-center gap-2 mb-4">
        <span className="px-2 py-0.5 bg-accent/10 border border-accent/20 text-[7px] font-black text-accent uppercase tracking-widest">{type}</span>
        <span className={`px-2 py-0.5 border border-white/5 text-[7px] font-black uppercase tracking-widest ${status === 'LIVE' ? 'text-green-400' : 'text-white/20'}`}>{status}</span>
      </div>
      <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">{title}</h3>
      <div className="flex items-center gap-4 text-white/20">
        <div className="flex items-center gap-1.5">
          <Eye className="w-3 h-3" />
          <span className="text-[9px] font-mono">{views} VIEWS</span>
        </div>
      </div>
    </div>
  </div>
);

export const Interfaces = () => {
  return (
    <div className="min-h-screen bg-obsidian p-8">
      <div className="max-w-[1400px] mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Layout className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">External_Modules // Surface_UI</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              ORVEXIA <span className="text-accent italic">INTERFACES</span>
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-surface-1 border border-white/5 text-white/40 text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
              <Share2 className="w-3.5 h-3.5" /> Portal_Links
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,95,31,0.2)]">
              <Plus className="w-4 h-4" /> Build_Interface
            </button>
          </div>
        </div>

        {/* View Switcher */}
        <div className="flex items-center gap-8 border-b border-white/[0.03] pb-4">
          {['ALL_PAGES', 'ACTIVE_FORMS', 'INTERNAL_PORTALS', 'DASHBOARDS'].map(tab => (
            <button key={tab} className={`text-[10px] font-black uppercase tracking-[0.2em] transition-all ${tab === 'ALL_PAGES' ? 'text-accent border-b border-accent pb-4 -mb-[17px]' : 'text-white/20 hover:text-white'}`}>
              {tab}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <InterfaceCard title="Client Onboarding Form" type="FORM" status="LIVE" views="1,240" />
          <InterfaceCard title="Executive Dashboard" type="DASHBOARD" status="INTERNAL" views="45" />
          <InterfaceCard title="Support Ticket Portal" type="PORTAL" status="LIVE" views="892" />
          <InterfaceCard title="Sales Leads Capture" type="FORM" status="LIVE" views="2,105" />
          
          <button className="h-full min-h-[160px] border border-dashed border-white/10 hover:border-accent/40 bg-white/[0.01] hover:bg-accent/[0.02] flex flex-col items-center justify-center gap-3 transition-all group">
            <div className="w-10 h-10 flex items-center justify-center bg-white/5 group-hover:bg-accent/10 transition-colors">
              <Plus className="w-5 h-5 text-white/20 group-hover:text-accent" />
            </div>
            <span className="text-[9px] font-black text-white/20 group-hover:text-white uppercase tracking-widest">Create_New_Blueprint</span>
          </button>
        </div>

        {/* Builder Preview Section */}
        <div className="bg-surface-1 border border-white/[0.05] p-12">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <h2 className="text-2xl font-black text-white uppercase tracking-wider leading-tight">
                Build native <span className="text-accent italic">applications</span> without leaving your workflow.
              </h2>
              <p className="text-[11px] font-mono text-white/30 uppercase tracking-widest leading-relaxed">
                Connect your Orvexia Tables directly to a drag-and-drop UI builder. 
                Deploy client portals, internal tools, and high-performance forms in seconds.
              </p>
              <div className="flex items-center gap-12 pt-4">
                <div className="space-y-2">
                  <p className="text-[14px] font-black text-white">100%</p>
                  <p className="text-[8px] font-mono text-white/20 uppercase">No_Code_Logic</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] font-black text-white">400ms</p>
                  <p className="text-[8px] font-mono text-white/20 uppercase">Render_Latency</p>
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] font-black text-white">∞</p>
                  <p className="text-[8px] font-mono text-white/20 uppercase">Interface_Scale</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-[400px] aspect-square bg-surface-2 border border-white/5 p-4 relative group">
              <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-full border border-white/5 flex items-center justify-center">
                 <MousePointer2 className="w-8 h-8 text-white/10 group-hover:text-accent group-hover:scale-110 transition-all duration-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
