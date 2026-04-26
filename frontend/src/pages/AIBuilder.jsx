import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, Zap, Terminal, Cpu, Database, Activity, Code, Shield } from 'lucide-react';

export const AIBuilder = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages([...messages, userMsg]);
    setLoading(true);
    setInput('');

    setTimeout(() => {
      const aiMsg = {
        role: 'assistant',
        content: `LOGIC_SYNTHESIS_COMPLETE: MODULE_ID_X9\n\nARCH_OVERVIEW:\n1. TRIGGER_NODE: MONITOR_UPSTREAM_EVENT\n2. PROCESSOR_NODE: DATA_TRANSFORM_LAYER\n3. ACTION_NODE: EXECUTE_OUTCOME_PROTOCOL\n\nPROCEED_TO_CANVAS_FOR_REFINEMENT.`
      };
      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 2000);
  };

  const suggestions = [
    'COMMS_SYNC: EMAIL_TO_SLACK_GATEWAY',
    'DATA_RECURSION: FORM_TO_DB_PIPELINE',
    'AUTH_VALIDATION: CRM_UPDATE_PROTOCOL',
  ];

  return (
    <div className="min-h-screen bg-obsidian p-8 flex flex-col items-center">
      <div className="w-full max-w-5xl space-y-12">
        
        {/* Header - Industrial Command Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Terminal className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Agentic_Engine // Core_Synthesis</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white">
              LOGIC <span className="text-accent italic">CONSTRUCTOR</span>
            </h1>
          </div>
          
          <div className="flex items-center gap-4 px-4 py-2 bg-surface-2 border border-white/5">
             <div className="w-2 h-2 bg-accent-success animate-pulse" />
             <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">Neural_Link: Stable</span>
          </div>
        </div>

        {/* Terminal Interface */}
        <div className="bg-surface-1 border border-white/[0.05] relative overflow-hidden flex flex-col shadow-2xl">
          {/* CRT Scanline Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
          
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.03] bg-surface-2">
             <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-white/5" />
                <div className="w-2 h-2 rounded-full bg-white/5" />
                <div className="w-2 h-2 rounded-full bg-white/5" />
             </div>
             <span className="text-[9px] font-mono text-white/10 uppercase tracking-[0.3em]">RECURSIVE_PROCESSOR_v2.0</span>
          </div>

          <div 
            ref={scrollRef}
            className="h-[500px] overflow-y-auto p-8 space-y-8 scrollbar-hide"
          >
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-surface-2 border border-white/5 flex items-center justify-center mb-8 relative group">
                  <div className="absolute inset-0 border border-accent/20 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                  <Cpu className="w-10 h-10 text-white/5 group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-xl font-black text-white uppercase tracking-[0.2em] mb-4">
                  Awaiting_Logic_Parameters
                </h3>
                <p className="text-[10px] font-mono text-white/20 uppercase tracking-[0.2em] mb-12 max-w-md">
                  Define the architectural parameters of your desired workflow for synthesis.
                </p>
                <div className="grid grid-cols-1 gap-3 w-full max-w-md">
                  {suggestions.map((suggestion, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(suggestion)}
                      className="w-full text-left px-6 py-4 bg-surface-2 border border-white/5 text-[10px] font-mono text-white/40 hover:text-white hover:border-accent/40 hover:bg-accent/5 transition-all uppercase tracking-widest"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {messages.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`flex gap-6 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center shrink-0 border transition-all ${
                      m.role === 'user' ? 'bg-white/5 border-white/10' : 'bg-accent/10 border-accent/20'
                    }`}>
                      {m.role === 'user' ? <Database className="w-5 h-5 text-white/20" /> : <Code className="w-5 h-5 text-accent" />}
                    </div>
                    <div
                      className={`max-w-[80%] p-6 border transition-all ${
                        m.role === 'user'
                          ? 'bg-surface-2 border-white/5 text-white/60'
                          : 'bg-white/[0.02] border-accent/20 text-white font-mono'
                      }`}
                    >
                      <p className={`text-[11px] leading-relaxed uppercase tracking-widest ${m.role === 'assistant' ? 'whitespace-pre-line' : ''}`}>
                        {m.content}
                      </p>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-6 justify-start"
                  >
                    <div className="w-10 h-10 bg-accent/10 border border-accent/20 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    </div>
                    <div className="p-6 bg-white/[0.02] border border-accent/20">
                      <div className="flex gap-2">
                        <div className="w-1.5 h-1.5 bg-accent animate-pulse" />
                        <div className="w-1.5 h-1.5 bg-accent animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-1.5 h-1.5 bg-accent animate-pulse" style={{ animationDelay: '0.4s' }} />
                        <span className="text-[9px] font-mono text-accent uppercase tracking-[0.3em] ml-4">Synthesizing_Architectural_Logic...</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Input Terminal */}
          <div className="p-6 border-t border-white/[0.03] bg-surface-2">
            <form onSubmit={handleSubmit} className="flex gap-4">
              <div className="relative flex-1 group">
                 <Terminal className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within:text-accent transition-colors" />
                 <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="INJECT_ARCH_DESCRIPTION..."
                  className="w-full pl-12 pr-6 py-4 bg-obsidian border border-white/5 text-[11px] font-mono text-white placeholder-white/10 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-10 py-4 bg-accent hover:bg-accent-dim text-white text-[11px] font-black uppercase tracking-widest disabled:opacity-20 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-2xl"
              >
                <Send className="w-4 h-4" />
                EXEC
              </button>
            </form>
          </div>
        </div>

        {/* System Monitoring Strip */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0 border-l border-t border-white/[0.03] relative z-10">
          {[
            { label: 'Neural_Depth', value: '4.8k', icon: Activity },
            { label: 'Sync_Latency', value: '0.4ms', icon: Shield },
            { label: 'Entropy_Level', value: '0.002%', icon: Database },
            { label: 'Thread_Count', value: '128_OPS', icon: Cpu },
          ].map((stat, i) => (
            <div key={i} className="p-6 bg-surface-1 border-r border-b border-white/[0.03] group hover:bg-white/[0.01] transition-all">
              <p className="text-[8px] font-mono text-white/10 uppercase tracking-[0.4em] mb-3">{stat.label}</p>
              <div className="flex items-center gap-3">
                 <stat.icon className="w-3 h-3 text-white/5 group-hover:text-accent transition-colors" />
                 <span className="text-sm font-black font-mono text-white/40 group-hover:text-white transition-colors">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};