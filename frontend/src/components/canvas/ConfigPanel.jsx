import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings, Trash2, Copy, CheckCircle, Zap,
  ChevronDown, User, RefreshCw, SkipForward, AlertTriangle,
  Terminal, Shield, Activity, Cpu
} from 'lucide-react';
import { AppLogos } from '../../pages/AppLogos';

const errorStrategies = [
  { id: 'retry', label: 'Retry_Protocol', icon: RefreshCw, desc: 'Retry up to 3 attempts' },
  { id: 'skip', label: 'Ignore_Fault', icon: SkipForward, desc: 'Proceed to next module' },
  { id: 'escalate', label: 'Critical_Halt', icon: AlertTriangle, desc: 'Immediate system stop' },
];

export const ConfigPanel = ({
  selectedNode,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
}) => {
  if (!selectedNode) return null;

  const { data } = selectedNode;
  const errorStrategy = data?.errorStrategy || 'retry';

  const handleLabelChange = (e) => {
    onUpdateNode(selectedNode.id, { ...data, label: e.target.value.toUpperCase() });
  };

  const handleStrategyChange = (strategyId) => {
    onUpdateNode(selectedNode.id, { ...data, errorStrategy: strategyId });
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="w-[360px] flex flex-col bg-surface-1 border-l border-white/[0.05] z-20 shrink-0"
        >
          {/* Header - Industrial Inspector */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center bg-accent/10 border border-accent/20">
                <Settings className="w-4 h-4 text-accent" />
              </div>
              <div>
                <h3 className="text-[11px] font-black text-white uppercase tracking-[0.2em]">
                  Configuration
                </h3>
                <p className="text-[9px] text-white/20 font-mono uppercase tracking-widest mt-0.5">
                  ID: {selectedNode.id.toUpperCase()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/20 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content - Monospace technical fields */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {/* Node Name */}
            <div className="space-y-3">
              <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                Module_Identity
              </label>
              <input
                type="text"
                value={data.label}
                onChange={handleLabelChange}
                className="w-full bg-surface-2 border border-white/5 p-3 text-[11px] font-mono text-white uppercase tracking-widest focus:outline-none focus:border-accent/40"
              />
            </div>

            {/* Connected App */}
            {data.app && (
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                  Service_Link
                </label>
                <div className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05]">
                  <div className="w-10 h-10 flex items-center justify-center bg-surface-2 border border-white/[0.05]">
                    {data.icon ? (
                      <AppLogos name={data.icon} className="w-5 h-5" />
                    ) : (
                      <Zap className="w-5 h-5 text-white/40" />
                    )}
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">{data.app}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-1.5 h-1.5 bg-accent-success" />
                      <span className="text-[8px] font-mono text-accent-success uppercase tracking-widest">Linked_Authorized</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Parameters */}
            <div className="space-y-3 pt-6 border-t border-white/[0.03]">
              <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                Runtime_Parameters
              </label>

              {/* Context-specific fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[8px] font-mono text-white/20 mb-2 uppercase tracking-widest">Target_Endpoint</label>
                  <input type="text" placeholder="https://api.internal/v1/..." className="w-full bg-surface-2 border border-white/5 p-3 text-[10px] font-mono text-white/60 placeholder-white/10 focus:outline-none focus:border-accent/40" />
                </div>
                <div>
                  <label className="block text-[8px] font-mono text-white/20 mb-2 uppercase tracking-widest">Payload_Strategy</label>
                  <div className="flex items-center justify-between p-3 bg-surface-2 border border-white/5 cursor-pointer">
                    <span className="text-[10px] font-mono text-white/40 uppercase">Default_JSON</span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Strategy */}
            <div className="space-y-4 pt-6 border-t border-white/[0.03]">
              <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                Fault_Tolerance
              </label>
              <div className="space-y-2">
                {errorStrategies.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleStrategyChange(s.id)}
                    className={`w-full flex items-center gap-4 p-4 border transition-all text-left ${
                      errorStrategy === s.id
                        ? 'bg-accent/5 border-accent/40 text-white'
                        : 'bg-white/[0.01] border-white/[0.03] text-white/30 hover:bg-white/[0.02]'
                    }`}
                  >
                    <s.icon className={`w-4 h-4 ${errorStrategy === s.id ? 'text-accent' : 'text-white/10'}`} />
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest">{s.label}</div>
                      <div className="text-[8px] font-mono uppercase tracking-widest opacity-40 mt-1">{s.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <div className="p-6 border-t border-white/[0.05] flex gap-3">
            <button
              onClick={() => onDuplicateNode(selectedNode)}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-white/[0.02] border border-white/[0.05] text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-white transition-all"
            >
              <Copy className="w-3.5 h-3.5" /> Clone
            </button>
            <button
              onClick={() => onDeleteNode(selectedNode.id)}
              className="flex-1 flex items-center justify-center gap-2 p-3 bg-accent-danger/5 border border-accent-danger/20 text-[10px] font-black uppercase tracking-widest text-accent-danger/60 hover:bg-accent-danger/10 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" /> Purge
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
