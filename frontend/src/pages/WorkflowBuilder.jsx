import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
  Terminal, Shield, Activity, Cpu, Filter
} from "lucide-react";
import { io } from "socket.io-client";
import { workflowApi } from "../lib/api";
import { API_BASE } from "../lib/api";
import { appsApi } from "../lib/api";
import { aiApi } from "../lib/api";
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
    { name: "Filter", icon: Filter, description: "Only continue if criteria met", color: "#A1A1AA" },
    { name: "Path", icon: GitBranch, description: "Split into multiple routes", color: "#A1A1AA" },
    { name: "Formatter", icon: FileCode, description: "Transform text, numbers, or dates", color: "#A1A1AA" },
    { name: "Evaluate", icon: Code, description: "Run custom JS logic", color: "#A1A1AA" },
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
    { name: "Google Drive", logo: "google-drive", description: "File management", color: "#4285F4" },
    { name: "Google Calendar", logo: "google-calendar", description: "Create events", color: "#4285F4" },
    { name: "Discord", logo: "discord", description: "Discord webhooks", color: "#5865F2" },
    { name: "Google Docs", logo: "google-docs", description: "Document automation", color: "#4285F4" },
    { name: "Google Keep", logo: "google-keep", description: "Notes automation", color: "#FABB05", badge: "BETA" },
    { name: "Google Meet", logo: "google-meet", description: "Schedule meetings", color: "#00832D" },
    { name: "Facebook", logo: "facebook", description: "Social media posts", color: "#1877F2", badge: "BETA" },
    { name: "Instagram", logo: "instagram", description: "Photo publishing", color: "#E4405F", badge: "BETA" },
    { name: "Stripe", logo: "stripe", description: "Payments", color: "#635BFF", badge: "BETA" },
    { name: "HubSpot", logo: "hubspot", description: "CRM automation", color: "#FF7A59", badge: "BETA" },
    { name: "Typeform", logo: "typeform", description: "Form submissions", color: "#262627", badge: "BETA" },
    { name: "Calendly", logo: "calendly", description: "Event scheduling", color: "#006BFF", badge: "BETA" },
  ],
};

const nodeTypes = { custom: CustomNode };
const edgeTypes = { custom: CustomEdge };
const APP_KEY_BY_NODE_TYPE = {
  gmail: "gmail",
  slack: "slack",
  notion: "notion",
  "google calendar": "google_calendar",
  "google meet": "google_meet",
  "google drive": "google_drive",
  "google docs": "google_docs",
  "google keep": "google_keep",
  "google note": "google_keep",
  "cal.com": "calcom",
  calendly: "calcom",
};

const GOOGLE_OAUTH_KEYS = new Set([
  "gmail",
  "google_calendar",
  "google_meet",
  "google_drive",
  "google_docs",
  "google_keep",
]);
const SLACK_OAUTH_KEYS = new Set(["slack"]);
const NOTION_OAUTH_KEYS = new Set(["notion"]);
const AUTH_RESUME_STORAGE_KEY = "orvexia_auth_resume_queue";
const COPILOT_MESSAGES_PREFIX = "orvexia_copilot_messages";
const COPILOT_WIDTH_STORAGE_KEY = "orvexia_copilot_width";
const TRIAGE_NODE_TYPES = new Set(["ai agent", "ai request", "create with ai", "filter", "condition", "formatter", "evaluate", "path", "delay"]);
const ARCHIVE_NODE_TYPES = new Set(["notion", "google docs", "google drive", "database query", "output"]);

const initialNodes = [];

const buildEdgeRecord = (source, target) => ({
  id: `e_${source}_${target}`,
  source,
  target,
  type: 'custom',
  data: { active: false },
  markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.3)' },
});

const sortNodesForFlow = (nodes = []) => {
  return [...nodes].sort((a, b) => {
    const ay = Number(a?.position?.y || 0);
    const by = Number(b?.position?.y || 0);
    if (ay !== by) return ay - by;
    const ax = Number(a?.position?.x || 0);
    const bx = Number(b?.position?.x || 0);
    return ax - bx;
  });
};

const isStartNode = (node) => String(node?.data?.label || node?.label || "").trim().toLowerCase() === "start";

const stripStartNodesFromGraph = (nodes = [], edges = []) => {
  const startIds = new Set(nodes.filter(isStartNode).map((node) => node.id));
  if (startIds.size === 0) {
    return { nodes, edges, removedStartCount: 0 };
  }

  return {
    nodes: nodes.filter((node) => !startIds.has(node.id)),
    edges: edges.filter((edge) => !startIds.has(edge.source) && !startIds.has(edge.target)),
    removedStartCount: startIds.size,
  };
};

const layoutWorkflowNodes = (nodes = [], edges = []) => {
  if (!Array.isArray(nodes) || nodes.length === 0) return nodes;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const incoming = new Map(nodes.map((n) => [n.id, 0]));
  const outgoing = new Map(nodes.map((n) => [n.id, []]));

  edges.forEach((e) => {
    if (!incoming.has(e.target) || !outgoing.has(e.source)) return;
    incoming.set(e.target, (incoming.get(e.target) || 0) + 1);
    outgoing.get(e.source).push(e.target);
  });

  const roots = nodes
    .filter((n) => (incoming.get(n.id) || 0) === 0)
    .sort((a, b) => (a.position?.y || 0) - (b.position?.y || 0));

  const levelById = new Map();
  const queue = [...roots.map((n) => ({ id: n.id, level: 0 }))];
  while (queue.length > 0) {
    const { id, level } = queue.shift();
    const prev = levelById.get(id);
    if (prev !== undefined && prev <= level) continue;
    levelById.set(id, level);
    (outgoing.get(id) || []).forEach((next) => queue.push({ id: next, level: level + 1 }));
  }

  // Unreachable / cycle-only nodes fallback
  nodes.forEach((n) => {
    if (!levelById.has(n.id)) levelById.set(n.id, 0);
  });

  const rows = new Map();
  const ordered = sortNodesForFlow(nodes);
  ordered.forEach((n) => {
    const level = levelById.get(n.id) || 0;
    if (!rows.has(level)) rows.set(level, []);
    rows.get(level).push(n.id);
  });

  const X_START = 240;
  const Y_START = 180;
  const X_GAP = 320;
  const Y_GAP = 180;
  const nextByLevel = new Map();

  return ordered.map((node) => {
    const level = levelById.get(node.id) || 0;
    const idx = nextByLevel.get(level) || 0;
    nextByLevel.set(level, idx + 1);
    return {
      ...node,
      position: {
        x: X_START + (level * X_GAP),
        y: Y_START + (idx * Y_GAP),
      },
    };
  });
};

const autoHealGraphConnectivity = (nodes = [], edges = []) => {
  if (!Array.isArray(nodes) || nodes.length < 2) {
    return { healedNodes: nodes, healedEdges: edges, addedCount: 0, removedOrphanStart: false };
  }

  const edgeKeySet = new Set(edges.map((edge) => `${edge.source}->${edge.target}`));
  const healedEdges = [...edges];
  let addedCount = 0;

  const addEdgeIfMissing = (source, target) => {
    if (!source || !target || source === target) return false;
    const key = `${source}->${target}`;
    if (edgeKeySet.has(key)) return false;
    healedEdges.push(buildEdgeRecord(source, target));
    edgeKeySet.add(key);
    addedCount += 1;
    return true;
  };

  const ordered = sortNodesForFlow(nodes);
  const rootNode = ordered[0];
  if (!rootNode) return { healedNodes: nodes, healedEdges, addedCount, removedOrphanStart: false };

  const incomingCount = new Map(nodes.map((node) => [node.id, 0]));
  healedEdges.forEach((edge) => {
    if (incomingCount.has(edge.target)) incomingCount.set(edge.target, incomingCount.get(edge.target) + 1);
  });

  // Phase 1: every node after the root should have at least one incoming edge.
  for (let index = 0; index < ordered.length; index += 1) {
    const node = ordered[index];
    if (!node || node.id === rootNode.id) continue;
    if ((incomingCount.get(node.id) || 0) > 0) continue;

    const fallbackSource =
      ordered[index - 1]?.id && ordered[index - 1].id !== node.id
        ? ordered[index - 1].id
        : rootNode.id;

    if (addEdgeIfMissing(fallbackSource, node.id)) {
      incomingCount.set(node.id, (incomingCount.get(node.id) || 0) + 1);
    }
  }

  const computeReachable = () => {
    const adjacency = new Map();
    nodes.forEach((node) => adjacency.set(node.id, []));
    healedEdges.forEach((edge) => {
      if (adjacency.has(edge.source)) adjacency.get(edge.source).push(edge.target);
    });

    const visited = new Set([rootNode.id]);
    const queue = [rootNode.id];
    while (queue.length > 0) {
      const current = queue.shift();
      const nextNodes = adjacency.get(current) || [];
      nextNodes.forEach((nextId) => {
        if (visited.has(nextId)) return;
        visited.add(nextId);
        queue.push(nextId);
      });
    }
    return visited;
  };

  // Phase 2: ensure all nodes are reachable from start.
  let reachable = computeReachable();
  for (let index = 0; index < ordered.length; index += 1) {
    const node = ordered[index];
    if (!node || reachable.has(node.id)) continue;

    const previousReachable = [...ordered.slice(0, index)].reverse().find((candidate) => reachable.has(candidate.id));
    const sourceId = previousReachable?.id || rootNode.id;

    if (addEdgeIfMissing(sourceId, node.id)) {
      reachable = computeReachable();
    }
  }

  return { healedNodes: nodes, healedEdges, addedCount, removedOrphanStart: false };
};

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
  const location = useLocation();
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
  const [copilotWidth, setCopilotWidth] = useState(() => {
    const raw = localStorage.getItem(COPILOT_WIDTH_STORAGE_KEY);
    const parsed = Number(raw);
    if (Number.isFinite(parsed)) return Math.min(560, Math.max(280, parsed));
    return 340;
  });
  const [isResizingCopilot, setIsResizingCopilot] = useState(false);
  const [nodeSamples, setNodeSamples] = useState({});
  const [appDirectory, setAppDirectory] = useState([]);
  const [pendingAuthQueue, setPendingAuthQueue] = useState([]);
  const [authSaving, setAuthSaving] = useState("");
  const [authForms, setAuthForms] = useState({});
  const [awaitingAuthResume, setAwaitingAuthResume] = useState(false);
  const [authBannerDismissed, setAuthBannerDismissed] = useState(false);
  const [authBannerExpanded, setAuthBannerExpanded] = useState(false);
  const [conversationLoaded, setConversationLoaded] = useState(false);
  const chatEndRef = useRef(null);
  const mainRef = useRef(null);
  const conversationSaveTimerRef = useRef(null);
  const activeMessageStorageKey = `${COPILOT_MESSAGES_PREFIX}_${id || "draft"}`;

  useEffect(() => {
    const persisted = localStorage.getItem(activeMessageStorageKey);
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          setConversationLoaded(true);
          return;
        }
      } catch {
        localStorage.removeItem(activeMessageStorageKey);
      }
    }

    if (id) {
      const draftCopy = localStorage.getItem(`${COPILOT_MESSAGES_PREFIX}_draft`);
      if (!draftCopy) return;
      try {
        const parsed = JSON.parse(draftCopy);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
          localStorage.setItem(activeMessageStorageKey, JSON.stringify(parsed));
          setConversationLoaded(true);
        }
      } catch {
        localStorage.removeItem(`${COPILOT_MESSAGES_PREFIX}_draft`);
      }
    }
    setConversationLoaded(true);
  }, [activeMessageStorageKey, id]);

  useEffect(() => {
    localStorage.setItem(activeMessageStorageKey, JSON.stringify(messages));
  }, [activeMessageStorageKey, messages]);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    const loadConversation = async () => {
      try {
        const result = await aiApi.getConversation(id);
        if (cancelled) return;
        const dbMessages = Array.isArray(result?.messages) ? result.messages : [];
        if (dbMessages.length > 0) {
          setMessages(dbMessages);
          localStorage.setItem(activeMessageStorageKey, JSON.stringify(dbMessages));
        }
      } catch {
        // Fall back to local storage conversation silently
      } finally {
        if (!cancelled) setConversationLoaded(true);
      }
    };

    setConversationLoaded(false);
    loadConversation();
    return () => {
      cancelled = true;
    };
  }, [id, activeMessageStorageKey]);

  useEffect(() => {
    if (!id || !conversationLoaded) return;
    if (conversationSaveTimerRef.current) clearTimeout(conversationSaveTimerRef.current);

    conversationSaveTimerRef.current = setTimeout(() => {
      aiApi.saveConversation(id, messages).catch(() => {
        // Keep local storage as fallback if API save fails
      });
    }, 500);

    return () => {
      if (conversationSaveTimerRef.current) clearTimeout(conversationSaveTimerRef.current);
    };
  }, [id, messages, conversationLoaded]);

  useEffect(() => {
    if (!isResizingCopilot) return;
    const onMove = (event) => {
      const left = mainRef.current?.getBoundingClientRect().left || 0;
      const next = Math.min(560, Math.max(280, event.clientX - left));
      setCopilotWidth(next);
    };
    const onUp = () => {
      setIsResizingCopilot(false);
      localStorage.setItem(COPILOT_WIDTH_STORAGE_KEY, String(copilotWidth));
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [isResizingCopilot, copilotWidth]);

  const classifyStage = useCallback((action) => {
    const nodeType = String(action?.nodeType || "").toLowerCase();
    const role = String(action?.role || "").toLowerCase();
    if (role === "trigger" || nodeType === "start" || nodeType === "webhook" || nodeType === "gmail") return "TRIGGER";
    if (TRIAGE_NODE_TYPES.has(nodeType)) return "TRIAGE";
    if (ARCHIVE_NODE_TYPES.has(nodeType)) return "ARCHIVE";
    return "ACTION";
  }, []);

  const buildPlanStagesFromActions = useCallback((actions = []) => {
    const addNodes = actions.filter((a) => a.type === "ADD_NODE");
    if (!addNodes.length) return [];

    const grouped = {
      TRIGGER: addNodes.filter((a) => classifyStage(a) === "TRIGGER"),
      TRIAGE: addNodes.filter((a) => classifyStage(a) === "TRIAGE"),
      ACTION: addNodes.filter((a) => classifyStage(a) === "ACTION"),
      ARCHIVE: addNodes.filter((a) => classifyStage(a) === "ARCHIVE"),
    };

    const labels = (arr) => arr.map((item) => item.nodeType).join(", ");
    const stages = [];
    if (grouped.TRIGGER.length) stages.push({ stage: "TRIGGER", title: "Capture Inputs", summary: labels(grouped.TRIGGER) });
    if (grouped.TRIAGE.length) stages.push({ stage: "TRIAGE", title: "Analyze and Route", summary: labels(grouped.TRIAGE) });
    if (grouped.ACTION.length) stages.push({ stage: "ACTION", title: "Execute Actions", summary: labels(grouped.ACTION) });
    if (grouped.ARCHIVE.length) stages.push({ stage: "ARCHIVE", title: "Store and Document", summary: labels(grouped.ARCHIVE) });
    return stages;
  }, [classifyStage]);

  const handleTestStep = async (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    // Simulate real API fetch delay
    setLogs(prev => [...prev, { id: Date.now(), timestamp: new Date().toLocaleTimeString(), severity: 'info', node: nodeId, message: `FETCHING_SAMPLE_DATA_FROM_${node.data.label}...` }]);
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const samples = {
      'Gmail': { 'Email_Body': 'Hi there, your order #123 has shipped!', 'Sender': 'support@store.com', 'Subject': 'Shipping Update', 'Attachment_Count': '0' },
      'Slack': { 'Message_TS': '1678234912.001', 'Channel_ID': 'C0123456', 'Sender_User': 'U9876543' },
      'GitHub': { 'Issue_URL': 'https://github.com/user/repo/issues/42', 'Issue_ID': '123456789', 'Status': 'open' },
      'Notion': { 'Page_ID': 'b55c9c91-384d-452b-81db-d1ef79372b75', 'URL': 'https://notion.so/New-Task-b55c...', 'Created_Time': new Date().toISOString() },
      'Google Drive': { 'File_ID': '1BxiMVs0X...', 'File_URL': 'https://docs.google.com/document/d/1Bxi...', 'Size_Bytes': '1024' },
      'Discord': { 'Message_ID': '111222333444555', 'Channel_ID': '999888777666', 'Author': 'ORvexiaBot' },
      'Webhook': { 'Payload': '{"event": "signup", "user_id": "99"}', 'Headers': '{"User-Agent": "Mozilla/5.0"}', 'Query_Params': '{"ref": "twitter"}', 'Sender_IP': '192.168.1.1' },
      'HTTP Request': { 'Response_Body': '{"status": "ok", "id": "req_555"}', 'Status_Code': '200', 'Headers': '{"Content-Type": "application/json"}', 'Request_Time': '124ms' }
    };

    const newSamples = samples[node.data.label] || { 'Result': 'Sample output data generated', 'Status': 'OK' };
    setNodeSamples(prev => ({ ...prev, [nodeId]: newSamples }));
    setLogs(prev => [...prev, { id: Date.now(), timestamp: new Date().toLocaleTimeString(), severity: 'success', node: nodeId, message: `SUCCESS: Sample record fetched for ${node.data.label}` }]);
  };

  // Load workflow
  useEffect(() => {
    if (id) {
      setIsLoading(true);
      workflowApi.getById(id).then((data) => {
        if (data) {
          setWorkflowName(data.name.toUpperCase());
          setTriggerSlug(data.triggerSlug);
          const cleaned = stripStartNodesFromGraph(Array.isArray(data.nodes) ? data.nodes : [], Array.isArray(data.edges) ? data.edges : []);
          if (data.nodes) setNodes(cleaned.nodes);
          if (data.edges) setEdges(cleaned.edges);
        }
      }).catch(console.error).finally(() => setIsLoading(false));
    }
  }, [id, setNodes, setEdges]);

  const loadAppDirectory = useCallback(async () => {
    try {
      const result = await appsApi.list();
      setAppDirectory(result.data || []);
      return result.data || [];
    } catch {
      return [];
    }
  }, []);

  useEffect(() => {
    loadAppDirectory();
  }, [loadAppDirectory]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const notices = [];
    if (params.get('slack_connected') === '1') notices.push('Slack connected successfully. You can continue automation setup.');
    if (params.get('notion_connected') === '1') notices.push('Notion connected successfully. You can continue automation setup.');
    if (params.get('slack_error')) notices.push(`Slack connection failed: ${params.get('slack_error')}`);
    if (params.get('notion_error')) notices.push(`Notion connection failed: ${params.get('notion_error')}`);
    if (notices.length > 0) {
      setMessages((prev) => [...prev, ...notices.map((text, idx) => ({
        id: Date.now() + idx,
        role: 'ai',
        text,
        type: text.includes('failed') ? 'error' : 'success',
      }))]);
      loadAppDirectory();
      const cleanPath = location.pathname;
      navigate(cleanPath, { replace: true });
    }
  }, [location.search, location.pathname, navigate, loadAppDirectory]);

  // Socket for live updates
  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || API_BASE);
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
    try {
      if (id) {
        await workflowApi.execute(id, { test: true, source: 'manual_run' });
      } else {
        await fetch(`${API_BASE}/api/webhook/${triggerSlug}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ test: true, source: 'manual_run' })
        });
      }
    } catch (e) {
      console.error(e);
      setLogs((prev) => [...prev, {
        id: Date.now(),
        timestamp: new Date().toISOString().split('T')[1].split('.')[0],
        severity: 'error',
        node: 'SYS',
        message: e.message || 'EXECUTION_FAILED_TO_START',
      }]);
    }
  };

  // --- Agentic: Add a block at a specific position in the flow ---
  const addBlockAtPosition = (block, categoryName, nodeId, position) => {
    const isTrigger = block.name === "Start" || block.name === "Webhook";
    const newNode = {
      id: nodeId || `node_${nodeIdCounter}`,
      type: 'custom',
      data: {
        label: block.name,
        nodeType: isTrigger ? "Trigger" : "Action",
        category: categoryName,
        description: block.description,
        app: block.logo ? block.name : undefined,
        icon: block.logo,
        color: block.color,
        badge: block.badge,
        status: 'idle',
      },
      position: position || { x: 400, y: nodes.length * 180 + 100 },
    };
    if (!nodeId) setNodeIdCounter((c) => c + 1);
    return newNode;
  };

  const addBlock = (block, category) => {
    // For manual drag-from-sidebar: place below last node in a clean column
    const lastNode = nodes[nodes.length - 1];
    const newPos = lastNode
      ? { x: lastNode.position.x, y: lastNode.position.y + 180 }
      : { x: 400, y: 200 };

    const newNode = addBlockAtPosition(block, typeof category === 'string' ? category : 'Actions', null, newPos);
    setNodeIdCounter((c) => c + 1);
    
    // Auto-connect to last node
    const newEdge = lastNode ? {
      id: `e_${lastNode.id}_${newNode.id}`,
      source: lastNode.id,
      target: newNode.id,
      type: 'custom',
      data: { active: false },
      markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.3)' },
    } : null;

    const nn = [...nodes, newNode];
    const ne = newEdge ? [...edges, newEdge] : edges;
    setNodes(nn);
    setEdges(ne);
    saveHistory(nn, ne);
  };

  const connectedAppKeys = useMemo(() => {
    return new Set(appDirectory.filter((app) => app.connected).map((app) => app.key));
  }, [appDirectory]);

  const mapNodeTypeToAppKey = (nodeType) => APP_KEY_BY_NODE_TYPE[String(nodeType || "").trim().toLowerCase()] || null;

  const openOAuthForApp = (appKey) => {
    const supportsGoogleOAuth = GOOGLE_OAUTH_KEYS.has(appKey);
    const supportsSlackOAuth = SLACK_OAUTH_KEYS.has(appKey);
    const supportsNotionOAuth = NOTION_OAUTH_KEYS.has(appKey);
    if (!supportsGoogleOAuth && !supportsSlackOAuth && !supportsNotionOAuth) return;
    if (pendingAuthQueue.length > 0) {
      sessionStorage.setItem(AUTH_RESUME_STORAGE_KEY, JSON.stringify(pendingAuthQueue));
    }
    const redirectPath = id ? `/workflows/builder/${id}` : "/workflows/builder";
    const token = localStorage.getItem("token");
    const authTokenQuery = token ? `&token=${encodeURIComponent(token)}` : "";
    if (supportsGoogleOAuth) {
      window.location.href = `${API_BASE}/api/v1/auth/google?redirect=${encodeURIComponent(redirectPath)}`;
      return;
    }
    if (supportsNotionOAuth) {
      window.location.href = `${API_BASE}/api/apps/notion/connect?redirect=${encodeURIComponent(redirectPath)}${authTokenQuery}`;
      return;
    }
    window.location.href = `${API_BASE}/api/apps/slack/connect?redirect=${encodeURIComponent(redirectPath)}${authTokenQuery}`;
  };

  const saveManualConnection = async (appKey) => {
    try {
      setAuthSaving(appKey);
      await appsApi.saveConnection(appKey, authForms[appKey] || {});
      await loadAppDirectory();
      setMessages((prev) => [...prev, {
        id: Date.now(),
        role: "ai",
        text: `✅ ${appKey.replace("_", " ")} connected. Resuming automation setup.`,
        type: "success",
      }]);
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: Date.now(),
        role: "ai",
        text: `⚠️ Could not connect ${appKey}: ${error.response?.data?.error || "invalid credential"}`,
        type: "error",
      }]);
    } finally {
      setAuthSaving("");
    }
  };

  useEffect(() => {
    const savedQueue = sessionStorage.getItem(AUTH_RESUME_STORAGE_KEY);
    if (!savedQueue) return;
    try {
      const parsed = JSON.parse(savedQueue);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPendingAuthQueue(parsed);
        setAwaitingAuthResume(true);
      }
    } catch {
      sessionStorage.removeItem(AUTH_RESUME_STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (!awaitingAuthResume || pendingAuthQueue.length === 0) return;
    const allConnected = pendingAuthQueue.every((item) => connectedAppKeys.has(item.appKey));
    if (!allConnected) return;

    setAwaitingAuthResume(false);
    setPendingAuthQueue([]);
    sessionStorage.removeItem(AUTH_RESUME_STORAGE_KEY);
    setMessages((prev) => [...prev, {
      id: Date.now(),
      role: "ai",
      text: "✅ All required app permissions are connected. Agent resumed and workflow is ready to run.",
      type: "success",
    }]);
  }, [awaitingAuthResume, pendingAuthQueue, connectedAppKeys]);

  // --- Agentic AI Send Message ---
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    const userPrompt = chatInput;
    setChatInput("");
    setIsAiTyping(true);

    try {
      const latestApps = await loadAppDirectory();
      const connectedNow = new Set((latestApps || []).filter((app) => app.connected).map((app) => app.key));
      const chatHistory = [...messages, userMsg]
        .slice(-14)
        .map((item) => ({ role: item.role, text: item.text }));

      const response = await fetch(`${API_BASE}/api/ai/architect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ prompt: userPrompt, currentNodes: nodes, currentEdges: edges, chatHistory })
      });
      const result = await response.json();

      if (result.status === 'success' && !result.message?.startsWith('AI_ERROR')) {
        // Show AI message
        setMessages(prev => [...prev, { id: Date.now() + 1, role: "ai", text: result.message }]);
        if (Array.isArray(result.followUpQuestions) && result.followUpQuestions.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...result.followUpQuestions.map((question, index) => ({
              id: Date.now() + 20 + index,
              role: "ai",
              text: `Q${index + 1}: ${question}`,
            })),
          ]);
        }
        if (Array.isArray(result.assumptions) && result.assumptions.length > 0) {
          setMessages((prev) => [
            ...prev,
            ...result.assumptions.map((item, index) => ({
              id: Date.now() + 40 + index,
              role: "ai",
              text: `ASSUMPTION ${index + 1}: ${item}`,
            })),
          ]);
        }

        if (result.flowDefinition && Array.isArray(result.flowDefinition.nodes) && Array.isArray(result.flowDefinition.edges)) {
          const cleanedFlow = stripStartNodesFromGraph(
            result.flowDefinition.nodes
              .filter((node) => node && node.id)
              .map((node, index) => {
                const matchedBlock = Object.values(blockCategories)
                  .flat()
                  .find((block) => String(block.name).toLowerCase() === String(node?.data?.label || "").toLowerCase());
                return {
                  ...node,
                  type: "custom",
                  position: node.position || { x: 240 + (index * 280), y: 220 },
                  data: {
                    ...(node.data || {}),
                    status: node?.data?.status || "configured",
                    icon: node?.data?.icon || matchedBlock?.logo,
                    color: node?.data?.color || matchedBlock?.color,
                  },
                };
              }),
            result.flowDefinition.edges
              .filter((edge) => edge && edge.source && edge.target)
              .map((edge) => buildEdgeRecord(edge.source, edge.target))
          );
          const incomingNodes = cleanedFlow.nodes;
          const incomingEdges = cleanedFlow.edges;
          const healedIncoming = autoHealGraphConnectivity(incomingNodes, incomingEdges);
          const finalIncomingNodes = healedIncoming.healedNodes || incomingNodes;
          const laidOutIncomingNodes = layoutWorkflowNodes(finalIncomingNodes, healedIncoming.healedEdges);
          setNodes(laidOutIncomingNodes);
          setEdges(healedIncoming.healedEdges);
          const maxIncomingIndex = laidOutIncomingNodes
            .map((node) => String(node.id || "").match(/^node_(\d+)$/))
            .filter(Boolean)
            .map((match) => Number(match[1]))
            .filter(Number.isFinite)
            .reduce((max, value) => Math.max(max, value), 0);
          setNodeIdCounter(maxIncomingIndex + 1);
          saveHistory(laidOutIncomingNodes, healedIncoming.healedEdges);
          setMessages((prev) => [...prev, {
            id: Date.now() + 14,
            role: "ai",
            text: `✅ Rebuilt a clean automation path with ${laidOutIncomingNodes.length} node(s) and ${healedIncoming.healedEdges.length} connection(s).${healedIncoming.removedOrphanStart ? " Removed orphan START automatically." : ""}`,
            type: "success",
          }]);
        } else if (result.actions && result.actions.length > 0) {
          let newNodes = [...nodes];
          let newEdges = [...edges];
          let authRequired = [];
          let addedNodeIds = [];
          let removedNodeIds = [];
          let invalidConnectRequests = 0;
          let currentCounter = nodeIdCounter;
          const stageRowIndex = { TRIGGER: 0, TRIAGE: 0, ACTION: 0, ARCHIVE: 0 };
          const stageColumnIndex = { TRIGGER: 0, TRIAGE: 1, ACTION: 2, ARCHIVE: 3 };
          let edgeKeySet = new Set(newEdges.map((edge) => `${edge.source}->${edge.target}`));
          const appendEdge = (source, target) => {
            if (!source || !target || source === target) return false;
            const key = `${source}->${target}`;
            if (edgeKeySet.has(key)) return false;
            newEdges.push(buildEdgeRecord(source, target));
            edgeKeySet.add(key);
            return true;
          };
          const generatedStages = Array.isArray(result.planStages) && result.planStages.length > 0
            ? result.planStages
            : buildPlanStagesFromActions(result.actions);

          if (generatedStages.length > 0) {
            const stageMessages = generatedStages.map((item, idx) => ({
              id: Date.now() + 100 + idx,
              role: "ai",
              text: `${item.stage}: ${item.title}. ${item.summary}`,
            }));
            setMessages((prev) => [...prev, ...stageMessages]);
          }

          // Process REMOVE_NODE actions first so planner can enforce strict app scope.
          result.actions
            .filter((a) => a.type === 'REMOVE_NODE')
            .forEach((action) => {
              const targetId = String(action.nodeId || '');
              if (!targetId) return;
              const exists = newNodes.some((node) => node.id === targetId);
              if (!exists) return;
              newNodes = newNodes.filter((node) => node.id !== targetId);
              newEdges = newEdges.filter((edge) => edge.source !== targetId && edge.target !== targetId);
              edgeKeySet = new Set(newEdges.map((edge) => `${edge.source}->${edge.target}`));
              removedNodeIds.push(targetId);
            });

          // Process ADD_NODE actions
          result.actions
            .filter(a => a.type === 'ADD_NODE')
            .forEach((action, index) => {
              // Find the block definition
              let matchedBlock = null;
              let matchedCategory = 'Actions';
              Object.entries(blockCategories).forEach(([catName, catBlocks]) => {
                const found = catBlocks.find(b => b.name === action.nodeType);
                if (found) { matchedBlock = found; matchedCategory = catName; }
              });

              if (!matchedBlock) {
                console.warn("AI returned unknown node type:", action.nodeType);
                return;
              }

              // Place AI-generated workflow in stage lanes (left -> right) for guided readability.
              const stage = classifyStage(action);
              const lane = stageColumnIndex[stage] ?? 2;
              const row = stageRowIndex[stage] ?? 0;
              stageRowIndex[stage] = row + 1;
              const pos = { x: 280 + (lane * 320), y: 180 + (row * 180) };

              const nodeId = action.nodeId || `node_${currentCounter}`;
              if (newNodes.some((node) => node.id === nodeId)) {
                return;
              }
              currentCounter++;

              const newNode = {
                id: nodeId,
                type: 'custom',
                data: {
                  label: matchedBlock.name,
                  nodeType: action.role === 'trigger' ? "Trigger" : "Action",
                  category: matchedCategory,
                  description: matchedBlock.description,
                  app: matchedBlock.logo ? matchedBlock.name : undefined,
                  icon: matchedBlock.logo,
                  color: matchedBlock.color,
                  badge: matchedBlock.badge,
                  status: action.requiresAuth ? 'needs_auth' : 'configured',
                  ...(action.config || {}),
                },
                position: pos,
              };

              newNodes.push(newNode);
              addedNodeIds.push(nodeId);

              // Track auth requirements
              if (action.requiresAuth) {
                authRequired.push({
                  nodeId,
                  appName: action.nodeType,
                  appKey: mapNodeTypeToAppKey(action.nodeType),
                  authType: action.authType || 'oauth2',
                });
              }
            });

          // Process CONNECT_NODES actions
          let validConnectCount = 0;
          result.actions
            .filter(a => a.type === 'CONNECT_NODES')
            .forEach(action => {
              const sourceExists = newNodes.find(n => n.id === action.source);
              const targetExists = newNodes.find(n => n.id === action.target);
              if (sourceExists && targetExists) {
                if (appendEdge(action.source, action.target)) validConnectCount += 1;
              } else {
                invalidConnectRequests += 1;
              }
            });

          const cleanedGraph = stripStartNodesFromGraph(newNodes, newEdges);
          newNodes = cleanedGraph.nodes;
          newEdges = cleanedGraph.edges;
          addedNodeIds = addedNodeIds.filter((nodeId) => newNodes.some((node) => node.id === nodeId));

          const addNodeRequests = result.actions.filter((action) => action.type === 'ADD_NODE');
          if (addNodeRequests.length > 0 && addedNodeIds.length === 0) {
            setMessages((prev) => [...prev, {
              id: Date.now() + 12,
              role: "ai",
              text: "⚠️ I couldn't build a usable flow because the generated plan only contained a placeholder Start node. Please try again with the app and action you want, like Gmail -> Slack auto-reply.",
              type: "error",
            }]);
            return;
          }

          if (addedNodeIds.length > 0) {
            const hasIncomingEdge = (nodeId) => newEdges.some((edge) => edge.target === nodeId);
            for (let index = 1; index < addedNodeIds.length; index += 1) {
              const currentNodeId = addedNodeIds[index];
              const previousNodeId = addedNodeIds[index - 1];
              if (!hasIncomingEdge(currentNodeId)) {
                appendEdge(previousNodeId, currentNodeId);
              }
            }

            if (validConnectCount === 0 && addedNodeIds.length > 1) {
              for (let index = 0; index < addedNodeIds.length - 1; index += 1) {
                appendEdge(addedNodeIds[index], addedNodeIds[index + 1]);
              }
            }
          }

          // Always auto-heal full graph connectivity after any Copilot build.
          const healResult = autoHealGraphConnectivity(newNodes, newEdges);
          newNodes = healResult.healedNodes || newNodes;
          newEdges = healResult.healedEdges;

          const laidOutNodes = layoutWorkflowNodes(newNodes, newEdges);
          // Apply all changes at once
          setNodes(laidOutNodes);
          setEdges(newEdges);
          setNodeIdCounter(currentCounter);
          saveHistory(laidOutNodes, newEdges);
          const createdEdges = Math.max(newEdges.length - edges.length, 0);
          const repairNote = invalidConnectRequests > 0
            ? ` Repaired ${invalidConnectRequests} invalid connection request(s).`
            : "";
          setMessages((prev) => [...prev, {
            id: Date.now() + 13,
            role: "ai",
            text: `✅ Built ${addedNodeIds.length} node(s), removed ${removedNodeIds.length} node(s), and created ${createdEdges} connection(s).${repairNote}${healResult.addedCount > 0 ? ` Auto-healed ${healResult.addedCount} missing flow link(s).` : ''}${healResult.removedOrphanStart ? " Removed orphan START automatically." : ""}`,
            type: "success",
          }]);

          // Show auth prompts if needed
          if (authRequired.length > 0) {
            const needsConnection = authRequired.filter((item) => item.appKey && !connectedNow.has(item.appKey));
            const alreadyConnected = authRequired.filter((item) => item.appKey && connectedNow.has(item.appKey));

            if (alreadyConnected.length > 0) {
              setMessages((prev) => [...prev, {
                id: Date.now() + 10,
                role: "ai",
                text: `✅ ${alreadyConnected.map((a) => a.appName).join(", ")} already connected.`,
                type: "success",
              }]);
            }

            if (needsConnection.length > 0) {
              setAwaitingAuthResume(true);
              setPendingAuthQueue(needsConnection);
              sessionStorage.setItem(AUTH_RESUME_STORAGE_KEY, JSON.stringify(needsConnection));
              setMessages((prev) => [...prev, {
                id: Date.now() + 11,
                role: "ai",
                text: `⏸️ Waiting for authorization: ${needsConnection.map((a) => a.appName).join(", ")}. Use the bottom connect bar, then I will resume automatically.`,
                type: "auth_wait",
              }]);
            }
          }

          if (Array.isArray(result.postBuildChecklist) && result.postBuildChecklist.length > 0) {
            setMessages((prev) => [
              ...prev,
              ...result.postBuildChecklist.map((step, index) => ({
                id: Date.now() + 300 + index,
                role: "ai",
                text: `NEXT ${index + 1}: ${step}`,
              })),
            ]);
          }
        }
      } else {
        // AI returned an error
        const errorText = result.message || "Service temporarily unavailable";
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          role: "ai",
          text: `⚠️ ${errorText.includes('AI_ERROR') ? 'The AI service is temporarily overloaded. Please try again in a few seconds.' : errorText}`,
          type: "error"
        }]);
      }
    } catch (error) {
      console.error("AI Architect Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: "ai",
        text: "⚠️ Connection error. Please check that the backend server is running and try again.",
        type: "error"
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const updateNode = (nodeId, newData) => { setNodes((nds) => nds.map((n) => n.id === nodeId ? { ...n, data: newData } : n)); };
  const deleteNode = (nodeId) => { const nn = nodes.filter((n) => n.id !== nodeId); const ne = edges.filter((e) => e.source !== nodeId && e.target !== nodeId); setNodes(nn); setEdges(ne); setSelectedNode(null); saveHistory(nn, ne); };
  const duplicateNode = (node) => { const nn = { ...node, id: `node_${nodeIdCounter}`, position: { x: node.position.x + 60, y: node.position.y + 60 } }; setNodeIdCounter((c) => c + 1); const newNodes = [...nodes, nn]; setNodes(newNodes); saveHistory(newNodes, edges); };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isAiTyping]);

  return (
    <div className="h-screen flex flex-col bg-obsidian overflow-hidden text-white font-sans">
      {/* Header - Industrial Command Bar */}
      <div className="h-14 flex items-center justify-between px-6 shrink-0 z-40 bg-surface-1 border-b border-white/[0.05]">
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
          <div className="flex items-center px-3 py-1.5 bg-white/[0.02] border border-white/5 rounded-full">
             <div className="w-2 h-2 bg-accent rounded-full animate-pulse mr-2" />
             <span className="text-[8px] font-mono text-white/40 uppercase tracking-widest">LIVE_SYNC_ACTIVE</span>
          </div>
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-surface-2 border border-white/5 text-[10px] font-black uppercase tracking-widest hover:border-accent/40 transition-all">
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isSaving ? "Commit_Changes" : "Commit_Changes"}
          </button>
        </div>
      </div>

      <div ref={mainRef} className="flex flex-1 overflow-hidden relative">
        {/* Left Side: AI Architect Sidebar (Zapier Style) */}
        <div style={{ width: `${copilotWidth}px` }} className="relative flex flex-col bg-surface-1 border-r border-white/[0.05] z-30 shrink-0">
          <button
            type="button"
            onMouseDown={() => setIsResizingCopilot(true)}
            className={`absolute top-0 right-0 h-full w-1.5 ${isResizingCopilot ? 'bg-accent/50' : 'bg-white/[0.04] hover:bg-accent/30'} cursor-col-resize transition-colors`}
            title="Resize Copilot"
          />
          <div className="px-6 py-4 border-b border-white/[0.05] flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <Sparkles className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white/70">AI_ARCHITECT</span>
            </div>
            <button onClick={() => setShowPalette(!showPalette)} className={`p-2 transition-all ${showPalette ? 'text-accent' : 'text-white/20'}`}>
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-0/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`max-w-[95%] p-4 text-[11px] leading-relaxed font-medium ${
                  msg.role === "user" 
                    ? "bg-accent/10 border border-accent/20 text-white/90 shadow-[0_0_20px_rgba(255,95,31,0.05)]" 
                    : msg.type === "success"
                    ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                    : msg.type === "error"
                    ? "bg-red-500/10 border border-red-500/20 text-red-400"
                    : msg.type === "auth_wait"
                    ? "bg-amber-500/10 border border-amber-500/20 text-amber-300"
                    : "bg-white/[0.02] border border-white/[0.05] text-white/60"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isAiTyping && (
              <div className="flex flex-col items-start gap-2">
                <div className="bg-white/[0.02] border border-white/[0.05] p-4 flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin text-accent" />
                  <span className="text-[10px] text-white/30 uppercase tracking-widest">Architecting workflow...</span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="p-4 bg-surface-1 border-t border-white/[0.05]">
            <form onSubmit={handleSendMessage} className="relative">
              <input 
                type="text" 
                value={chatInput} 
                onChange={(e) => setChatInput(e.target.value)} 
                placeholder={awaitingAuthResume ? "WAITING_FOR_AUTHORIZATION..." : "DESCRIBE_LOGIC_TO_BUILD..."} 
                disabled={awaitingAuthResume}
                className="w-full bg-surface-2 border border-white/5 p-4 pr-12 text-[10px] text-white placeholder-white/20 uppercase tracking-widest focus:outline-none focus:border-accent/40" 
              />
              <button type="submit" disabled={awaitingAuthResume} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-accent hover:text-white transition disabled:opacity-40">
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Center: Canvas Area */}
        <div className="flex-1 flex flex-row relative bg-[#09090b]">
           {/* Activity Palette (Slides in from left) */}
           <ActivityPalette isOpen={showPalette} onClose={() => setShowPalette(false)} blockCategories={blockCategories} onAddBlock={addBlock} searchQuery={paletteSearch} setSearchQuery={setPaletteSearch} />

           <div className="flex-1 flex flex-col relative overflow-hidden">
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
        </div>

        {/* Right: Config Panel (Zapier Style - Persistent when node selected) */}
        <div className={`w-[400px] bg-surface-1 border-l border-white/[0.05] transition-all duration-500 z-30 ${selectedNode ? 'translate-x-0' : 'translate-x-full fixed right-0'}`}>
           <ConfigPanel 
            selectedNode={selectedNode} 
            onClose={() => setSelectedNode(null)} 
            onUpdateNode={updateNode} 
            onDeleteNode={deleteNode} 
            onDuplicateNode={duplicateNode} 
            allNodes={nodes}
            nodeSamples={nodeSamples}
            onTestStep={handleTestStep}
            appDirectory={appDirectory}
            workflowId={id || ''}
            onRefreshConnections={loadAppDirectory}
          />
        </div>
      </div>

      <AnimatePresence>
        {awaitingAuthResume && pendingAuthQueue.length > 0 && !authBannerDismissed && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 35 }}
            className="fixed bottom-0 left-0 right-0 z-[80]"
          >
            {/* Compact bar */}
            <div className="flex items-center justify-between gap-4 px-5 py-2.5 bg-amber-500/15 border-t border-amber-500/30 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="text-[9px] font-black uppercase tracking-widest text-amber-200">
                  {pendingAuthQueue.filter(i => !connectedAppKeys.has(i.appKey)).length} app(s) need connection
                </span>
                <div className="flex items-center gap-1.5 ml-2">
                  {pendingAuthQueue.slice(0, 4).map((item, i) => (
                    <span key={i} className="px-2 py-0.5 bg-black/30 border border-white/10 text-[8px] font-bold text-white/50 uppercase">{item.appName}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAuthBannerExpanded(v => !v)}
                  className="px-3 py-1.5 bg-amber-500/20 border border-amber-500/30 text-amber-200 text-[8px] font-black uppercase tracking-widest hover:bg-amber-500/30 transition-all"
                >
                  {authBannerExpanded ? 'Collapse' : 'Connect'}
                </button>
                <button
                  onClick={() => setAuthBannerDismissed(true)}
                  className="px-2 py-1.5 text-white/30 hover:text-white text-[10px] font-black transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>
            {/* Expandable details */}
            <AnimatePresence>
              {authBannerExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-surface-1/95 backdrop-blur-xl border-t border-white/5 overflow-hidden"
                >
                  <div className="p-4 flex flex-wrap gap-3 max-h-[200px] overflow-y-auto">
                    {pendingAuthQueue.map((item) => {
                      const app = appDirectory.find((entry) => entry.key === item.appKey);
                      const credentialMode = app?.credentialMode || "manual";
                      const isOAuth = ["google_oauth", "slack_oauth", "notion_oauth"].includes(credentialMode) || item.appKey === "gmail";
                      const connected = connectedAppKeys.has(item.appKey);
                      return (
                        <div key={`${item.nodeId}_${item.appKey}`} className="flex items-center gap-3 border border-white/10 bg-black/20 px-4 py-2.5 min-w-[200px]">
                          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-white flex-1">{item.appName}</span>
                          {!connected && isOAuth && (
                            <button
                              onClick={() => openOAuthForApp(item.appKey)}
                              className="px-3 py-1.5 bg-white text-black text-[8px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-colors"
                            >
                              Connect
                            </button>
                          )}
                          {connected && (
                            <span className="text-[8px] font-bold text-emerald-400 uppercase">✓ Ready</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      <CommandKModal isOpen={showCmdK} onClose={() => setShowCmdK(false)} onAction={(action) => { if (action === 'toggle-cmdk') setShowCmdK((v) => !v); }} />
    </div>
  );
};
