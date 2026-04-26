import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  MiniMap, Controls, Background, useNodesState, useEdgesState,
  addEdge, BackgroundVariant, MarkerType, useReactFlow, ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "gsap";
import {
  Play, Save, ArrowLeft, Settings as SettingsIcon, Undo2, Redo2,
  Plus, X, Search, ZoomIn, ZoomOut, Maximize2, ChevronUp, Bot, Send,
  Sparkles, PanelLeftClose, PanelLeftOpen, Loader2, Command,
  Globe, Zap, GitBranch, Clock, Code, Repeat, Box, Database, FileCode,
  Terminal, Shield, Activity, Cpu
} from "lucide-react";
import { io } from "socket.io-client";
import { workflowApi } from "../lib/api";
import CustomNode from "../components/canvas/CustomNode";
import CustomEdge from "../components/canvas/CustomEdge";
import { ActivityPalette } from "../components/canvas/ActivityPalette";
import { CommandKModal } from "../components/canvas/CommandKModal";
import { LogStream } from "../components/canvas/LogStream";
import { ConfigPanel } from "../components/canvas/ConfigPanel";

// Block categories data
const blockCategories = {
  Actions: [
    { name: "HTTP Request", icon: Globe, description: "Send an HTTP request", color: "#FF5F1F" },
    { name: "Flow Module", icon: Box, description: "Use another flow", color: "#FF5F1F" },
    { name: "Database Query", icon: Database, description: "Query your database", color: "#FF5F1F" },
  ],
  Trigger: [
    { name: "Start", icon: Zap, description: "Start of workflow", color: "#FF5F1F" },
    { name: "Webhook", icon: Zap, description: "Trigger on webhook", color: "#FF5F1F" },
    { name: "Output", icon: Zap, description: "Output data", color: "#FF5F1F" },
  ],
  AI: [
    { name: "AI Agent", icon: Bot, description: "Autonomous AI agent", color: "#FF5F1F" },
    { name: "Create with AI", icon: Sparkles, description: "AI text/image generation", color: "#FF5F1F" },
    { name: "AI Request", icon: FileCode, description: "Send AI request", color: "#FF5F1F", badge: "BETA" },
  ],
  Logic: [
    { name: "Condition", icon: GitBranch, description: "Branch data", color: "#A1A1AA" },
    { name: "If", icon: GitBranch, description: "True/false branch", color: "#A1A1AA" },
    { name: "Evaluate", icon: Code, description: "Transform data", color: "#A1A1AA" },
    { name: "Delay", icon: Clock, description: "Wait for time", color: "#A1A1AA" },
  ],
  Looping: [
    { name: "For Each", icon: Repeat, description: "Loop over items", color: "#A1A1AA" },
    { name: "While", icon: Repeat, description: "Loop while true", color: "#A1A1AA" },
  ],
  Apps: [
    { name: "Gmail", logo: "gmail", description: "Send/receive emails", color: "#EA4335" },
    { name: "Slack", logo: "slack", description: "Slack messages", color: "#4A154B" },
    { name: "GitHub", logo: "github", description: "GitHub integration", color: "#181717" },
    { name: "Notion", logo: "notion", description: "Notion pages", color: "#000000" },
    { name: "Stripe", logo: "stripe", description: "Payments", color: "#635BFF" },
  ],
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };

const initialNodes = [{
  id: "node_0", type: "custom",
  data: { label: "Start", nodeType: "Trigger", category: "Trigger", description: "System entry point" },
  position: { x: 400, y: 200 },
}];

// --- INNER CANVAS ---
const CanvasInner = ({ nodes, edges, onNodesChange, onEdgesChange, onConnect, onNodeClick, undo, redo, historyIndex, history, onRun, setShowCmdK }) => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  return (
    <>
      <ReactFlow
        nodes={nodes} edges={edges}
        onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
        onConnect={onConnect} onNodeClick={onNodeClick}
        nodeTypes={nodeTypes} edgeTypes={edgeTypes}
        fitView className="canvas-grid"
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{ type: 'custom', animated: false }}
      >
        <Background variant={BackgroundVariant.Dots} gap={30} size={1} color="rgba(255,255,255,0.03)" />
        <Controls 
          showInteractive={false} 
          className="!bg-surface-1 !border !border-white/[0.05] !p-1 !rounded-none" 
        />
        <MiniMap 
          nodeColor={() => '#FF5F1F'} 
          maskColor="rgba(9,9,11,0.8)" 
          className="!bg-surface-1 !border !border-white/[0.05] !rounded-none"
          pannable zoomable 
        />
      </ReactFlow>

      {/* Bottom toolbar - Industrial Dock */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 p-1 bg-surface-1 border border-white/[0.05] shadow-2xl">
          <button onClick={undo} disabled={historyIndex === 0} className="p-2.5 text-white/40 hover:text-white disabled:opacity-10 transition-colors" title="Undo">
            <Undo2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={redo} disabled={historyIndex === history.length - 1} className="p-2.5 text-white/40 hover:text-white disabled:opacity-10 transition-colors" title="Redo">
            <Redo2 className="w-3.5 h-3.5" />
          </button>
          
          <div className="w-[1px] h-4 bg-white/[0.05] mx-2" />
          
          <button onClick={() => zoomOut()} className="p-2.5 text-white/40 hover:text-white transition-colors"><ZoomOut className="w-3.5 h-3.5" /></button>
          <button onClick={() => zoomIn()} className="p-2.5 text-white/40 hover:text-white transition-colors"><ZoomIn className="w-3.5 h-3.5" /></button>
          <button onClick={() => fitView({ padding: 0.2 })} className="p-2.5 text-white/40 hover:text-white transition-colors"><Maximize2 className="w-3.5 h-3.5" /></button>
          
          <div className="w-[1px] h-4 bg-white/[0.05] mx-2" />
          
          <button onClick={() => setShowCmdK(true)} className="flex items-center gap-2 px-3 py-1.5 hover:bg-white/[0.03] text-[9px] font-black uppercase tracking-[0.2em] text-white/30 transition-all">
            <Command className="w-3 h-3" /> COMMAND_SEARCH
          </button>
          
          <button onClick={onRun} className="flex items-center gap-2 px-6 py-2 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all ml-1">
            <Play className="w-3 h-3 fill-current" /> Execute_Flow
          </button>
        </div>
      </div>
    </>
  );
};

// --- MAIN EXPORT ---
export const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState("NEW_ARCHITECTURE_MODULE");
  const [showPalette, setShowPalette] = useState(true);
  const [showCmdK, setShowCmdK] = useState(false);
  const [paletteSearch, setPaletteSearch] = useState('');
  const [history, setHistory] = useState([{ nodes: initialNodes, edges: [] }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [triggerSlug, setTriggerSlug] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [messages, setMessages] = useState([{ id: 1, role: "ai", text: "SYSTEM_READY: I am your architectural copilot. Describe the logic you wish to implement." }]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);
  const mainRef = useRef(null);

  // Load workflow
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      workflowApi.getById(id).then((data) => {
        if (data) {
          setWorkflowName(data.name.toUpperCase());
          setTriggerSlug(data.triggerSlug);
          if (data.nodes) setNodes(data.nodes);
          if (data.edges) setEdges(data.edges);
        }
      }).catch(console.error).finally(() => setIsLoading(false));
    }
  }, [id, setNodes, setEdges]);

  // Socket for live updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://orvexia-backend.vercel.app');
    socket.on('workflow_update', (data) => {
      setNodes((nds) => nds.map((n) => n.id === data.nodeId ? { ...n, data: { ...n.data, status: data.status.toLowerCase() } } : n));
      setEdges((eds) => eds.map((e) => e.source === data.nodeId ? { ...e, data: { ...e.data, active: data.status === 'RUNNING' } } : e));
      const ts = new Date().toISOString().split('T')[1].split('.')[0];
      setLogs((prev) => [...prev, {
        id: Date.now(), timestamp: ts,
        severity: data.status === 'SUCCESS' ? 'success' : data.status === 'FAILED' ? 'error' : 'info',
        node: data.nodeId, message: `NODE_${data.nodeId.toUpperCase()} → ${data.status}`,
      }]);
    });
    return () => socket.disconnect();
  }, [setNodes, setEdges]);

  const saveHistory = (n, e) => {
    const h = history.slice(0, historyIndex + 1);
    h.push({ nodes: n, edges: e });
    setHistory(h);
    setHistoryIndex(h.length - 1);
  };

  const undo = () => { if (historyIndex > 0) { setHistoryIndex(historyIndex - 1); setNodes(history[historyIndex - 1].nodes); setEdges(history[historyIndex - 1].edges); } };
  const redo = () => { if (historyIndex < history.length - 1) { setHistoryIndex(historyIndex + 1); setNodes(history[historyIndex + 1].nodes); setEdges(history[historyIndex + 1].edges); } };

  const onConnect = useCallback((params) => {
    const ne = addEdge({ ...params, type: 'custom', data: { active: false }, markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.1)' } }, edges);
    setEdges(ne);
    saveHistory(nodes, ne);
  }, [edges, nodes]);

  const onNodeClick = useCallback((_, node) => setSelectedNode(node), []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await workflowApi.create({ name: workflowName, nodes, edges, triggerSlug });
      if (result?.triggerSlug) { setTriggerSlug(result.triggerSlug); if (!id && result.workflowId) navigate(`/workflows/builder/${result.workflowId}`, { replace: true }); }
    } catch (e) { console.error(e); } finally { setIsSaving(false); }
  };

  const handleRun = async () => {
    if (!triggerSlug) { alert("SAVE_PROTOCOL_REQUIRED: Save workflow to execute."); return; }
    setLogs((prev) => [...prev, { id: Date.now(), timestamp: new Date().toISOString().split('T')[1].split('.')[0], severity: 'info', node: 'SYS', message: 'EXECUTION_INITIATED...' }]);
    try { await fetch(`/api/webhook/${triggerSlug}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ test: true }) }); } catch (e) { console.error(e); }
  };

  const addBlock = (block, category) => {
    const isTrigger = block.name === "Start" || block.name === "Webhook";
    const newNode = {
      id: `node_${nodeIdCounter}`, type: 'custom',
      data: { label: block.name, nodeType: isTrigger ? "Trigger" : "Action", category, description: block.description, app: block.logo ? block.name : undefined, icon: block.logo, color: block.color, badge: block.badge },
      position: { x: Math.random() * 300 + 200, y: Math.random() * 300 + 100 },
    };
    setNodeIdCounter((c) => c + 1);
    const nn = [...nodes, newNode];
    setNodes(nn);
    saveHistory(nn, edges);
  };

  const updateNode = (nodeId, newData) => { setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: newData } : n)); };
  const deleteNode = (nodeId) => { const nn = nodes.filter((n) => n.id !== nodeId); const ne = edges.filter((e) => e.source !== nodeId && e.target !== nodeId); setNodes(nn); setEdges(ne); setSelectedNode(null); saveHistory(nn, ne); };
  const duplicateNode = (node) => { const nn = { ...node, id: `node_${nodeIdCounter}`, position: { x: node.position.x + 60, y: node.position.y + 60 } }; setNodeIdCounter((c) => c + 1); const newNodes = [...nodes, nn]; setNodes(newNodes); saveHistory(newNodes, edges); };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), role: "user", text: chatInput }]);
    setChatInput("");
    setIsAiTyping(true);
    setTimeout(() => { setMessages((prev) => [...prev, { id: Date.now(), role: "ai", text: `PROTOCOL_UPDATE: Configuring logic for "${chatInput.toUpperCase()}"` }]); setIsAiTyping(false); }, 1500);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isAiTyping]);

  return (
    <div className="h-screen flex flex-col bg-obsidian overflow-hidden text-white font-sans">
      {/* Header - Industrial Command Bar */}
      <div className="h-14 flex items-center justify-between px-6 shrink-0 z-30 bg-surface-1 border-b border-white/[0.05]">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate("/workflows")} className="flex items-center gap-2 text-white/20 hover:text-white transition text-[10px] font-black uppercase tracking-[0.2em]">
            <ArrowLeft className="w-3.5 h-3.5" /> ESC_BACK
          </button>
          <div className="h-4 w-[1px] bg-white/[0.05]" />
          <div className="flex items-center gap-3">
            <Terminal className="w-4 h-4 text-accent" />
            <input 
              type="text" 
              value={workflowName} 
              onChange={(e) => setWorkflowName(e.target.value.toUpperCase())} 
              className="bg-transparent border-none text-[12px] font-black tracking-widest text-white/80 focus:outline-none focus:text-white w-64 uppercase" 
            />
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:border-accent/40 transition-all">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? "Saving..." : "Commit_Changes"}
          </button>
          <button onClick={() => setIsCopilotOpen(!isCopilotOpen)} className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all border ${isCopilotOpen ? "bg-accent/10 border-accent/40 text-accent" : "bg-surface-2 border-white/5 text-white/40"}`}>
            <Sparkles className="w-3.5 h-3.5" /> AI_Architect
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Activity Palette */}
        <ActivityPalette isOpen={showPalette} onClose={() => setShowPalette(false)} blockCategories={blockCategories} onAddBlock={addBlock} searchQuery={paletteSearch} setSearchQuery={setPaletteSearch} />

        {/* AI Copilot Sidebar */}
        <AnimatePresence>
          {isCopilotOpen && (
            <motion.div initial={{ width: 0, opacity: 0 }} animate={{ width: 340, opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="flex flex-col bg-surface-1 border-r border-white/[0.05] z-20 overflow-hidden">
              <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between">
                <div className="flex items-center gap-3"><Bot className="w-4 h-4 text-accent" /><span className="text-[10px] font-black uppercase tracking-widest text-white/70">Agentic_Builder</span></div>
                <button onClick={() => setIsCopilotOpen(false)} className="text-white/20 hover:text-white"><PanelLeftClose className="w-4 h-4" /></button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-0">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                    <div className={`text-[8px] font-mono mb-1 uppercase tracking-widest text-white/20`}>{msg.role === "ai" ? "AGENT_ORVEXIA" : "ARCHITECT_ADMIN"}</div>
                    <div className={`max-w-[90%] p-4 text-[11px] leading-relaxed font-medium ${msg.role === "ai" ? "bg-white/[0.02] border border-white/[0.05] text-white/60" : "bg-accent/10 border border-accent/20 text-white/90"}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (<div className="flex flex-col items-start"><div className="text-[8px] font-mono mb-1 text-white/20">AGENT_SYNCING...</div><div className="bg-white/[0.02] p-4 flex gap-1"><span className="w-1 h-1 bg-accent rounded-full animate-pulse" /><span className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} /><span className="w-1 h-1 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} /></div></div>)}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-white/[0.05]">
                <form onSubmit={handleSendMessage} className="relative">
                  <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="ENTER_LOGIC_DESCRIPTION..." className="w-full bg-surface-2 border border-white/5 p-4 text-[10px] text-white placeholder-white/20 uppercase tracking-widest focus:outline-none focus:border-accent/40" />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-accent hover:bg-accent-dim transition"><Send className="w-3.5 h-3.5 text-white" /></button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Canvas Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="flex-1 relative">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-white/20">
                <Loader2 className="w-8 h-8 animate-spin text-accent" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em]">Syncing_Architecture...</span>
              </div>
            ) : (
              <ReactFlowProvider>
                <CanvasInner nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} onNodeClick={onNodeClick} undo={undo} redo={redo} historyIndex={historyIndex} history={history} onRun={handleRun} setShowCmdK={setShowCmdK} />
              </ReactFlowProvider>
            )}
          </div>
          <LogStream logs={logs} onClear={() => setLogs([])} />
        </div>

        {/* Config Panel */}
        <ConfigPanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} onUpdateNode={updateNode} onDeleteNode={deleteNode} onDuplicateNode={duplicateNode} />
      </div>

      <CommandKModal isOpen={showCmdK} onClose={() => setShowCmdK(false)} onAction={(action) => { if (action === 'toggle-cmdk') setShowCmdK((v) => !v); }} />
    </div>
  );
};
