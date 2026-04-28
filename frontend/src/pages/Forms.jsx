import { motion } from "framer-motion";
import { FileText, Plus, Search, Terminal } from "lucide-react";

export const Forms = () => {
  return (
    <div className="min-h-screen bg-obsidian p-8">
      <div className="max-w-[1600px] mx-auto space-y-12">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Input_Capture // Forms_01</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              ORVEXIA <span className="text-accent italic">FORMS</span>
            </h1>
          </div>
          <button className="flex items-center gap-2 px-6 py-2.5 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all">
            <Plus className="w-4 h-4" /> Build_Form
          </button>
        </div>

        <div className="bg-surface-1 border border-white/[0.05] p-12 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-16 h-16 bg-surface-2 border border-white/5 flex items-center justify-center">
            <FileText className="w-8 h-8 text-white/10" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-widest mb-2">No_Forms_Found</h3>
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em]">Create a form to trigger your architectures from user input.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
