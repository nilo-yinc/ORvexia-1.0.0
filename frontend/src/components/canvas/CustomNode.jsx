import { memo, useEffect, useRef, useState } from 'react';
import { Handle, Position } from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import {
  Globe, Zap, Bot, Sparkles, GitBranch, Clock, Code,
  Filter, Repeat, Box, Database, FileCode, User,
  CheckCircle, XCircle, Loader2, SkipForward, Circle,
  Terminal, Activity, Cpu, Share2, Plus
} from 'lucide-react';
import { AppLogos } from '../../pages/AppLogos';

// Icon map
const iconMap = {
  'HTTP Request': Globe,
  'Flow Module': Box,
  'Database Query': Database,
  'Start': Zap,
  'Webhook': Zap,
  'Output': Zap,
  'AI Agent': Bot,
  'Create with AI': Sparkles,
  'AI Request': FileCode,
  'Condition': GitBranch,
  'Validate': FileCode,
  'If': GitBranch,
  'Evaluate': Code,
  'Delay': Clock,
  'OR': GitBranch,
  'For Each': Repeat,
  'While': Repeat,
};

const StatusIndicator = ({ status }) => {
  switch (status) {
    case 'success':
      return <div className="w-1.5 h-1.5 bg-accent-success shadow-[0_0_8px_rgba(141,205,255,0.8)]" />;
    case 'error':
      return <div className="w-1.5 h-1.5 bg-accent-danger shadow-[0_0_8px_rgba(239,68,68,0.8)]" />;
    case 'running':
      return <div className="w-1.5 h-1.5 bg-accent shadow-[0_0_8px_rgba(255,95,31,0.8)] animate-pulse" />;
    default:
      return <div className="w-1.5 h-1.5 bg-white/10" />;
  }
};

const CustomNode = memo(({ id, data, selected }) => {
  const nodeRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const { label, nodeType, description, app, icon: logoName, status, category, color } = data;

  const isTrigger = nodeType === 'Trigger';
  const IconComponent = iconMap[label] || Zap;

  return (
    <motion.div
      ref={nodeRef}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative group`}
      style={{ perspective: '1000px' }}
    >
      {/* Node Body */}
      <div
        className={`
          relative z-10 min-w-[220px] bg-surface-1 border transition-all duration-300
          ${selected ? 'border-accent shadow-[0_0_25px_rgba(255,95,31,0.2)]' : 'border-white/[0.05]'}
          ${isHovered ? 'border-white/20' : ''}
        `}
        style={{ borderRadius: '0px' }}
      >
        {/* Top Edge Accent */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-white/[0.02]" />
        
        {/* Left Side Status Bar */}
        <div 
          className="absolute top-0 left-0 w-[3px] h-full transition-all duration-300"
          style={{ backgroundColor: selected || isHovered ? '#FF5F1F' : 'rgba(255,255,255,0.05)' }}
        />

        {/* Header Section */}
        <div className="pl-5 pr-3 py-4 border-b border-white/[0.03] flex items-center justify-between bg-surface-2/30">
          <div className="flex items-center gap-4">
            <div className={`
              w-7 h-7 flex items-center justify-center bg-surface-2 border border-white/[0.08]
              ${selected || isHovered ? 'text-accent border-accent/40 shadow-[0_0_10px_rgba(255,95,31,0.1)]' : 'text-white/40'}
              transition-all duration-300
            `}>
              {logoName ? (
                <AppLogos name={logoName} className="w-4 h-4" />
              ) : (
                <IconComponent className="w-3.5 h-3.5" />
              )}
            </div>
            
            <div className="flex flex-col">
              <span className="text-[12px] font-black tracking-tight text-white uppercase group-hover:text-accent transition-colors">
                {label}
              </span>
              <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest leading-none mt-1">
                {nodeType}::{id.toUpperCase()}
              </span>
            </div>
          </div>
          
          <StatusIndicator status={status} />
        </div>

        {/* Content Section */}
        <div className="pl-5 pr-4 py-4">
          {description && (
            <p className="text-[10px] font-mono text-white/30 leading-relaxed uppercase tracking-widest line-clamp-2">
              {description}
            </p>
          )}
          
          {app && (
            <div className="mt-3 flex items-center gap-2">
              <div className="px-2 py-1 bg-white/[0.03] border border-white/5 text-[8px] font-mono text-white/40 uppercase tracking-widest group-hover:border-white/10 transition-colors">
                INTEGRATION: {app}
              </div>
            </div>
          )}
        </div>

        {/* Technical Bottom Decor */}
        <div className="h-1 bg-white/[0.01] flex items-center px-5 gap-1">
          <div className="w-1 h-1 bg-white/5" />
          <div className="flex-1 h-[1px] bg-white/[0.02]" />
        </div>
      </div>

      {/* --- CONNECTION HANDLES --- */}
      
      {/* Target Handle (Input) - Top */}
      {!isTrigger && (
        <Handle
          type="target"
          position={Position.Top}
          className="!w-3 !h-3 !rounded-none !bg-obsidian !border-2 !border-accent/40 hover:!border-accent hover:!scale-150 !transition-all !duration-200 !-top-1.5 !z-20"
        />
      )}

      {/* Source Handle (Output) - Bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !rounded-none !bg-obsidian !border-2 !border-accent/40 hover:!border-accent hover:!scale-150 !transition-all !duration-200 !-bottom-1.5 !z-20"
      />
      
      {/* Selection Glow */}
      {selected && (
        <div className="absolute inset-0 -z-10 bg-accent/5 blur-2xl pointer-events-none" />
      )}
    </motion.div>
  );
});

CustomNode.displayName = 'CustomNode';
export default CustomNode;
