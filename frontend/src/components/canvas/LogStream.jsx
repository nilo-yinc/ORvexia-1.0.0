import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, ChevronUp, ChevronDown, X, Trash2,
  Info, AlertTriangle, XCircle, CheckCircle,
} from 'lucide-react';

const severityConfig = {
  info: { icon: Info, color: 'text-white/20', bg: 'bg-white/[0.01]', label: 'INF' },
  success: { icon: CheckCircle, color: 'text-accent-success', bg: 'bg-accent-success/5', label: 'SUC' },
  warning: { icon: AlertTriangle, color: 'text-accent', bg: 'bg-accent/5', label: 'WRN' },
  error: { icon: XCircle, color: 'text-accent-danger', bg: 'bg-accent-danger/5', label: 'ERR' },
};

const LogEntry = ({ log, index }) => {
  const config = severityConfig[log.severity] || severityConfig.info;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.1, delay: 0.01 }}
      className={`flex items-start gap-4 px-6 py-1.5 font-mono text-[10px] uppercase tracking-widest leading-none border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group`}
    >
      {/* Timestamp */}
      <span className="text-white/10 shrink-0 select-all">
        {log.timestamp}
      </span>

      {/* Severity */}
      <span className={`${config.color} shrink-0 font-black`}>
        [{config.label}]
      </span>

      {/* Node tag */}
      {log.node && (
        <span className="text-accent/60 shrink-0 font-bold">
          {log.node.toUpperCase()}
        </span>
      )}

      {/* Message */}
      <span className="text-white/40 flex-1 truncate">
        {log.message}
      </span>

      {/* Separator */}
      <div className="w-8 h-[1px] bg-white/[0.05] mt-2 group-hover:bg-accent/20 transition-all" />
    </motion.div>
  );
};

export const LogStream = ({ logs = [], onClear }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [height, setHeight] = useState(240);
  const scrollRef = useRef(null);
  const isDragging = useRef(false);

  // Auto-scroll on new logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Resize handle
  const handleMouseDown = (e) => {
    isDragging.current = true;
    const startY = e.clientY;
    const startH = height;

    const handleMove = (e) => {
      if (!isDragging.current) return;
      const delta = startY - e.clientY;
      setHeight(Math.max(120, Math.min(600, startH + delta)));
    };

    const handleUp = () => {
      isDragging.current = false;
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  const displayLogs = logs.length > 0 ? logs : [
    { id: 0, timestamp: '00:00:00.000', severity: 'info', message: 'TELEMETRY_STREAM_READY: RUN_FLOW_FOR_DATA', node: 'SYS' },
  ];

  return (
    <div className="relative border-t border-white/[0.05]">
      {/* Resize handle */}
      {isExpanded && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute top-0 left-0 right-0 h-[2px] cursor-ns-resize z-10 bg-accent/20 hover:bg-accent transition-colors"
        />
      )}

      {/* Header bar - Industrial Terminal Tab */}
      <div className="flex items-center justify-between px-6 py-3 bg-surface-1">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-3 text-white/20 hover:text-white transition-colors"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">
            Telemetry_Stream
          </span>
          <div className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white/30 ml-2">
            {String(logs.length).padStart(3, '0')}
          </div>
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 ml-2" />
          ) : (
            <ChevronUp className="w-3.5 h-3.5 ml-2" />
          )}
        </button>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3">
            {Object.entries(severityConfig).map(([key, cfg]) => {
              const count = logs.filter((l) => l.severity === key).length;
              if (count === 0) return null;
              return (
                <div key={key} className="flex items-center gap-1.5">
                   <div className={`w-1.5 h-1.5 ${cfg.color.replace('text-', 'bg-')}`} />
                   <span className={`text-[9px] font-mono ${cfg.color} opacity-60 uppercase`}>{cfg.label}</span>
                </div>
              );
            })}
          </div>
          {logs.length > 0 && (
            <button
              onClick={onClear}
              className="text-white/20 hover:text-accent-danger transition-colors"
              title="PURGE_LOGS"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Log content - CRT style terminal */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height }}
            exit={{ height: 0 }}
            className="overflow-hidden bg-obsidian relative border-t border-white/[0.03]"
          >
            {/* Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
            
            <div
              ref={scrollRef}
              className="h-full overflow-y-auto py-2 scrollbar-hide"
            >
              {displayLogs.map((log, i) => (
                <LogEntry key={log.id || i} log={log} index={i} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
