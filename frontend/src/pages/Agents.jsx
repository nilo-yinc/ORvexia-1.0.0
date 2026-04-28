import { motion } from "framer-motion";
import { Bot, Plus, Search, Terminal, Sparkles } from "lucide-react";

export const Agents = () => {
  return (
    <div className="min-h-screen bg-obsidian p-8">
      <div className="max-w-[1600px] mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Bot className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Autonomous_Units // Agents_01</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              ORVEXIA <span className="text-accent italic">AGENTS</span>
            </h1>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all">
            <Sparkles className="w-4 h-4" /> Deploy_Agent
          </button>
        </div>

        <div className="bg-surface-1 border border-white/[0.05] p-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-surface-2 border border-white/5 flex items-center justify-center">
            <Bot className="w-8 h-8 text-white/10" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest mb-2">No_Agents_Active</h3>
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Configure an autonomous agent to handle complex decision-making.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
