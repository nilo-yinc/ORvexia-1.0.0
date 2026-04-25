import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  BackgroundVariant,
  MarkerType,
  useReactFlow,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  Save,
  Download,
  Upload,
  Zap,
  Globe,
  FileText,
  ArrowLeft,
  Settings as SettingsIcon,
  Undo2,
  Redo2,
  Search,
  Plus,
  X,
  GitBranch,
  Clock,
  Code,
  Filter,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ChevronUp,
  Bot,
  Send,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  Terminal,
  Repeat,
  Box,
  Database,
  FileCode,
  User,
} from "lucide-react";
import { io } from "socket.io-client";
import { AppLogos } from "./AppLogos";
import { workflowApi } from "../lib/api";

// --- DATA: Block Categories ---
const blockCategories = {
  Actions: [
    {
      name: "HTTP Request",
      icon: Globe,
      description: "Create and send an HTTP request",
      color: "#ef4444",
    },
    {
      name: "Flow Module",
      icon: Box,
      description: "Use another flow inside this flow",
      color: "#8b5cf6",
    },
    {
      name: "Database Query",
      icon: Database,
      description: "Query your database",
      color: "#06b6d4",
    },
  ],
  Trigger: [
    {
      name: "Start",
      icon: Zap,
      description: "Start of the workflow",
      color: "#10b981",
    },
    {
      name: "Webhook",
      icon: Zap,
      description: "Trigger on webhook event",
      color: "#f59e0b",
    },
    {
      name: "Output",
      icon: Zap,
      description: "Output data from your flow",
      color: "#14b8a6",
    },
  ],
  AI: [
    {
      name: "AI Agent",
      icon: Bot,
      description: "Build agents that can autonomously complete complex tasks",
      color: "#6366f1",
    },
    {
      name: "Create with AI",
      icon: Sparkles,
      description:
        "Use AI to write text, create images, transform data and more",
      color: "#8b5cf6",
    },
    {
      name: "AI Request",
      icon: FileCode,
      description: "Create and send an AI request",
      color: "#ec4899",
      badge: "BETA",
    },
  ],
  Logic: [
    {
      name: "Condition",
      icon: GitBranch,
      description:
        "Use TypeScript or FQL to define expressions for branching data",
      color: "#f59e0b",
    },
    {
      name: "Validate",
      icon: FileCode,
      description: "Ensure your data matches a JSON schema",
      color: "#06b6d4",
    },
    {
      name: "If",
      icon: GitBranch,
      description: "Use TypeScript or FQL to branch data to true/false output",
      color: "#f59e0b",
    },
    {
      name: "Evaluate",
      icon: Code,
      description: "Transform and query data using TypeScript or FQL",
      color: "#8b5cf6",
    },
    {
      name: "Delay",
      icon: Clock,
      description: "Wait for a specified amount of time",
      color: "#14b8a6",
    },
    {
      name: "OR",
      icon: GitBranch,
      description:
        "Outputs only the data from whichever input receives data first",
      color: "#f59e0b",
    },
  ],
  Looping: [
    {
      name: "For Each",
      icon: Repeat,
      description: "Execute blocks for each item in a collection",
      color: "#8b5cf6",
    },
    {
      name: "While",
      icon: Repeat,
      description: "Execute blocks while condition is true",
      color: "#8b5cf6",
    },
  ],
  Apps: [
    {
      name: "Gmail",
      logo: "gmail",
      description: "Send and receive emails via Gmail",
      color: "#EA4335",
    },
    {
      name: "Google Drive",
      logo: "drive",
      description: "Access and manage files in Google Drive",
      color: "#4285F4",
    },
    {
      name: "Google Sheets",
      logo: "sheets",
      description: "Create and manage Google Sheets",
      color: "#34A853",
    },
    {
      name: "Google Calendar",
      logo: "calendar",
      description: "Manage events in Google Calendar",
      color: "#4285F4",
    },
    {
      name: "Slack",
      logo: "slack",
      description: "Send messages and notifications to Slack",
      color: "#4A154B",
    },
    {
      name: "Telegram",
      logo: "telegram",
      description: "Send messages via Telegram Bot API",
      color: "#26A5E4",
    },
    {
      name: "GitHub",
      logo: "github",
      description: "Interact with GitHub repositories and issues",
      color: "#181717",
    },
    {
      name: "Notion",
      logo: "notion",
      description: "Create and update Notion pages and databases",
      color: "#000000",
    },
    {
      name: "Discord",
      logo: "discord",
      description: "Send messages and manage Discord servers",
      color: "#5865F2",
    },
    {
      name: "Trello",
      logo: "trello",
      description: "Manage Trello boards, lists, and cards",
      color: "#0079BF",
    },
    {
      name: "Outlook",
      logo: "outlook",
      description: "Send emails and manage Outlook calendar",
      color: "#0078D4",
    },
    {
      name: "Excel",
      logo: "excel",
      description: "Create and update Excel spreadsheets",
      color: "#217346",
    },
    {
      name: "Stripe",
      logo: "stripe",
      description: "Accept payments and manage Stripe",
      color: "#635BFF",
    },
  ],
};

// --- INITIAL DATA ---
const popularApps = [
  {
    name: "Microsoft Excel",
    logo: "excel",
    category: "apps",
    triggers: ["New Row", "Updated Row"],
    actions: ["Add Row", "Update Row", "Find Row"],
  },
  {
    name: "Google Drive",
    logo: "drive",
    category: "apps",
    triggers: ["New File", "New Folder"],
    actions: ["Upload File", "Create Folder", "Move File"],
  },
  {
    name: "Gmail",
    logo: "gmail",
    category: "apps",
    triggers: ["New Email", "New Labeled Email"],
    actions: ["Send Email", "Create Draft", "Add Label"],
  },
  {
    name: "Notion",
    logo: "notion",
    category: "apps",
    triggers: ["New Database Item", "Updated Page"],
    actions: ["Create Page", "Update Database Item"],
  },
  {
    name: "Telegram",
    logo: "telegram",
    category: "apps",
    triggers: ["New Message", "New Channel Post"],
    actions: ["Send Message", "Send Photo"],
  },
  {
    name: "GitHub",
    logo: "github",
    category: "apps",
    triggers: ["New Issue", "Push Event"],
    actions: ["Create Issue", "Create PR"],
  },
  {
    name: "Google Calendar",
    logo: "calendar",
    category: "apps",
    triggers: ["Event Start", "New Event"],
    actions: ["Create Event", "Update Event"],
  },
  {
    name: "Google Sheets",
    logo: "sheets",
    category: "apps",
    triggers: ["New Row", "Updated Row"],
    actions: ["Create Row", "Update Row", "Clear Row"],
  },
  {
    name: "Slack",
    logo: "slack",
    category: "apps",
    triggers: ["New Message", "New Reaction"],
    actions: ["Send Message", "Send Direct Message"],
  },
  {
    name: "HubSpot",
    logo: "hubspot",
    category: "apps",
    triggers: ["New Contact", "Updated Deal"],
    actions: ["Create Contact", "Update Contact"],
  },
  {
    name: "Google Forms",
    logo: "googleforms",
    category: "apps",
    triggers: ["New Response"],
    actions: ["Create Form"],
  },
  {
    name: "Facebook Lead Ads",
    logo: "facebook",
    category: "apps",
    triggers: ["New Lead"],
    actions: [],
  },
  {
    name: "Mailchimp",
    logo: "mailchimp",
    category: "apps",
    triggers: ["New Subscriber", "Unsubscribe"],
    actions: ["Add Subscriber", "Update Subscriber"],
  },
  {
    name: "Microsoft Outlook",
    logo: "outlook",
    category: "apps",
    triggers: ["New Email"],
    actions: ["Send Email", "Create Event"],
  },
  {
    name: "Trello",
    logo: "trello",
    category: "apps",
    triggers: ["New Card", "Card Moved"],
    actions: ["Create Card", "Update Card", "Move Card"],
  },
  {
    name: "Stripe",
    logo: "stripe",
    category: "apps",
    triggers: ["New Payment", "Failed Payment"],
    actions: ["Create Customer", "Create Invoice"],
  },
  {
    name: "Twitter",
    logo: "twitter",
    category: "apps",
    triggers: ["New Tweet", "New Mention"],
    actions: ["Post Tweet", "Like Tweet"],
  },
];

const builtInTools = [
  {
    name: "Webhooks",
    icon: Zap,
    category: "home",
    triggers: ["Catch Hook"],
    actions: ["POST Request", "GET Request"],
  },
  {
    name: "Schedule",
    icon: Clock,
    category: "home",
    triggers: ["Every Hour", "Every Day", "Custom"],
    actions: [],
  },
  {
    name: "Email",
    icon: "📨",
    category: "home",
    triggers: ["New Email"],
    actions: ["Send Email"],
  },
  {
    name: "RSS",
    icon: "📡",
    category: "home",
    triggers: ["New Item in Feed"],
    actions: [],
  },
  {
    name: "Code",
    icon: Code,
    category: "home",
    triggers: [],
    actions: ["Run JavaScript", "Run Python"],
  },
  {
    name: "Email Parser",
    icon: "📬",
    category: "home",
    triggers: ["New Email"],
    actions: ["Parse Email"],
  },
  {
    name: "Storage",
    icon: "💾",
    category: "home",
    triggers: [],
    actions: ["Store Value", "Get Value"],
  },
  {
    name: "Formatter",
    icon: "✨",
    category: "utilities",
    triggers: [],
    actions: ["Format Text", "Format Date", "Format Number"],
  },
  {
    name: "Filter",
    icon: Filter,
    category: "flow-controls",
    triggers: [],
    actions: ["Continue If", "Stop If"],
  },
  {
    name: "Paths",
    icon: GitBranch,
    category: "flow-controls",
    triggers: [],
    actions: ["Split Path"],
  },
  {
    name: "Delay",
    icon: Clock,
    category: "flow-controls",
    triggers: [],
    actions: ["Delay For", "Delay Until"],
  },
];

const appCategories = [
  { id: "home", label: "All Apps", icon: Zap },
  { id: "apps", label: "Connected Apps", icon: Globe },
  { id: "flow-controls", label: "Flow Controls", icon: Filter },
];

const nodeTypes = {};
const edgeTypes = {};

const initialNodes = [
  {
    id: "start",
    type: "input",
    data: { label: "Start", nodeType: "Trigger" },
    position: { x: 400, y: 200 },
    style: {
      background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      padding: "16px 24px",
      fontWeight: "600",
      fontSize: "14px",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
      textAlign: "center",
      minWidth: "150px",
    },
  },
];

const initialEdges = [];

// --- HELPER: Node Styling ---
const getNodeStyle = (type = "default") => ({
  background:
    type === "Trigger"
      ? "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)"
      : "#1f2937",
  color: "#ffffff",
  border: type === "Trigger" ? "none" : "1px solid #374151",
  borderRadius: "12px",
  padding: "16px 24px",
  fontWeight: "600",
  fontSize: "14px",
  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
  minWidth: "200px",
  textAlign: "center",
});

// --- INNER CANVAS COMPONENT ---
const WorkflowCanvasInner = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  undo,
  redo,
  historyIndex,
  history,
  openBlockSelector,
  showBlockSelector,
  searchQuery,
  setSearchQuery,
  filteredBlocks,
  addBlockFromSelector,
  setShowBlockSelector,
  onRun,
}) => {
  const { fitView, zoomIn, zoomOut } = useReactFlow();

  const handleZoomIn = () => zoomIn();
  const handleZoomOut = () => zoomOut();
  const handleFitView = () => fitView({ padding: 0.2 });

  return (
    <>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-[#0B0D14]"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#334155"
        />
        <Controls
          className="bg-[#1e293b] border-none fill-white text-white rounded-lg shadow-xl"
          style={{ button: { backgroundColor: "#1e293b", fill: "white" } }}
        />
        <MiniMap
          className="bg-[#1e293b] border-none rounded-lg shadow-xl"
          nodeColor={(node) => node.style?.background || "#3b82f6"}
          maskColor="rgba(0, 0, 0, 0.3)"
        />
      </ReactFlow>

      {/* --- BLOCK SELECTOR POPUP --- */}
      <AnimatePresence>
        {showBlockSelector && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[400px] bg-[#111827] border border-[#374151] rounded-xl shadow-2xl overflow-hidden z-[100] flex flex-col max-h-[600px]"
          >
            {/* Search Bar */}
            <div className="p-3 border-b border-[#374151]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for blocks or requests"
                  autoFocus
                  className="w-full pl-9 pr-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* List of Blocks */}
            <div
              className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {Object.entries(filteredBlocks).map(([category, blocks]) => (
                <div key={category} className="mb-4">
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {category}
                  </div>
                  {blocks.map((block, idx) => (
                    <button
                      key={idx}
                      onClick={() => addBlockFromSelector(block)}
                      className="w-full flex items-start gap-3 p-2 rounded-lg hover:bg-[#1f2937] transition text-left group"
                    >
                      {block.logo ? (
                        <div className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 bg-[#1f2937] border border-[#374151] group-hover:border-gray-500 transition">
                          <AppLogos name={block.logo} className="w-5 h-5" />
                        </div>
                      ) : (
                        <div
                          className="w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: `${block.color}20` }}
                        >
                          <block.icon
                            className="w-4 h-4"
                            style={{ color: block.color }}
                          />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-200 group-hover:text-white">
                            {block.name}
                          </span>
                          {block.badge && (
                            <span className="px-1.5 py-0.5 bg-blue-900/50 text-blue-300 text-[10px] font-bold rounded border border-blue-800">
                              {block.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {block.description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowBlockSelector(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED BOTTOM TOOLBAR */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transform translate-x-[-15%]">
        <div className="bg-[#111827] border border-[#374151] rounded-xl shadow-2xl px-4 py-2 flex items-center gap-3">
          <button
            onClick={undo}
            disabled={historyIndex === 0}
            className="p-2 hover:bg-[#1f2937] rounded-lg disabled:opacity-30 transition text-gray-400 hover:text-white"
            title="Undo"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            onClick={redo}
            disabled={historyIndex === history.length - 1}
            className="p-2 hover:bg-[#1f2937] rounded-lg disabled:opacity-30 transition text-gray-400 hover:text-white"
            title="Redo"
          >
            <Redo2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#374151]" />
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-[#1f2937] rounded-lg transition text-gray-400 hover:text-white"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-[#1f2937] rounded-lg transition text-gray-400 hover:text-white"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleFitView}
            className="p-2 hover:bg-[#1f2937] rounded-lg transition text-gray-400 hover:text-white"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-[#374151]" />

          <button
            onClick={() => {
              setShowBlockSelector(!showBlockSelector);
              setSearchQuery("");
            }}
            className={`flex items-center gap-2 px-4 py-2 hover:bg-[#374151] text-white text-sm font-medium rounded-lg transition border border-[#374151] ${showBlockSelector ? "bg-[#374151]" : "bg-[#1f2937]"
              }`}
          >
            <Plus className="w-4 h-4" />
            Block
          </button>

          <button
            onClick={onRun}
            className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold rounded-lg transition flex items-center gap-2 shadow-lg shadow-orange-900/20"
          >
            <Play className="w-4 h-4 fill-current" />
            Run
            <ChevronUp className="w-3 h-3" />
          </button>
        </div>
      </div>
    </>
  );
};

export const WorkflowBuilder = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if present
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [workflowName, setWorkflowName] = useState("New flow module");

  // States
  const [showBlockSelector, setShowBlockSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('home');
  const [history, setHistory] = useState([{ nodes: initialNodes, edges: initialEdges }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [nodeIdCounter, setNodeIdCounter] = useState(1);
  const [currentNodeForApp, setCurrentNodeForApp] = useState(null);
  const [triggerSlug, setTriggerSlug] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // AI Copilot States
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "ai",
      text: "Hi! I can help you build this workflow. What would you like to do?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef(null);

  // Connection State
  const [connectingFrom, setConnectingFrom] = useState(null);

  // Load workflow if ID is present
  useEffect(() => {
    if (id) {
      const loadWorkflow = async () => {
        setIsLoading(true);
        try {
          const data = await workflowApi.getById(id);
          if (data) {
            setWorkflowName(data.name);
            setTriggerSlug(data.triggerSlug);
            if (data.nodes) setNodes(data.nodes);
            if (data.edges) setEdges(data.edges);
          }
        } catch (error) {
          console.error("Failed to load workflow", error);
        } finally {
          setIsLoading(false);
        }
      };
      loadWorkflow();
    }
  }, [id, setNodes, setEdges]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: workflowName,
        nodes,
        edges,
        triggerSlug: triggerSlug, // Pass slug if we have it (for updates)
      };
      const result = await workflowApi.create(payload);
      if (result && result.triggerSlug) {
        setTriggerSlug(result.triggerSlug);

        // If we just created a new workflow, switch the URL to the edit URL
        if (!id && result.workflowId) {
          navigate(`/workflows/builder/${result.workflowId}`, {
            replace: true,
          });
        }
      }
    } catch (error) {
      console.error("Failed to save workflow", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRun = async () => {
    if (!triggerSlug) {
      alert("Please save the workflow first to generate a trigger slug.");
      return;
    }
    try {
      await fetch(`/api/webhook/${triggerSlug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
    } catch (e) {
      console.error("Run failed", e);
    }
  };

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'https://orvexia-backend.vercel.app');

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('workflow_update', (data) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === data.nodeId) {
            let newStyle = { ...node.style };
            if (data.status === 'RUNNING') {
              newStyle.border = '2px solid #fbbf24';
              newStyle.boxShadow = '0 0 15px rgba(251, 191, 36, 0.6)';
              newStyle.transition = 'all 0.3s ease';
            } else if (data.status === 'SUCCESS') {
              newStyle.border = '2px solid #10b981';
              newStyle.boxShadow = '0 0 15px rgba(16, 185, 129, 0.6)';
              newStyle.transition = 'all 0.3s ease';
            } else if (data.status === 'FAILED') {
              newStyle.border = '2px solid #ef4444';
              newStyle.boxShadow = '0 0 15px rgba(239, 68, 68, 0.6)';
              newStyle.transition = 'all 0.3s ease';
            }
            return { ...node, style: newStyle };
          }
          return node;
        })
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [setNodes]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        redo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [historyIndex, history, nodes, edges, workflowName, triggerSlug]);

  // AI Copilot Handlers
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = { id: Date.now(), role: "user", text: chatInput };
    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg = {
        id: Date.now() + 1,
        role: "ai",
        text: `I understand you want to "${userMsg.text}". I can help configure the nodes for that.`,
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsAiTyping(false);
    }, 1500);
  };

  const handleQuickAction = (action) => {
    setChatInput(action);
    // Optionally auto-submit:
    // handleSendMessage({ preventDefault: () => {} });
  };

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isAiTyping]);

  const onConnect = useCallback(
    (params) => {
      const newEdges = addEdge(
        {
          ...params,
          animated: true,
          type: "smoothstep",
          markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
          style: { stroke: "#64748b", strokeWidth: 2 },
        },
        edges
      );
      setEdges(newEdges);
      saveHistory(nodes, newEdges);
    },
    [edges, nodes]
  );

  const saveHistory = (newNodes, newEdges) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: newNodes, edges: newEdges });
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setNodes(history[historyIndex - 1].nodes);
      setEdges(history[historyIndex - 1].edges);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setNodes(history[historyIndex + 1].nodes);
      setEdges(history[historyIndex + 1].edges);
    }
  };

  // --- Filtering Logic for Block Selector ---
  const filteredBlocks = Object.entries(blockCategories).reduce(
    (acc, [category, blocks]) => {
      const filtered = blocks.filter(
        (block) =>
          searchQuery === "" ||
          block.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) {
        acc[category] = filtered;
      }
      return acc;
    },
    {}
  );

  const addBlockFromSelector = (block) => {
    let nodeType = "default";
    let nodeData = {
      label: block.name,
      nodeType: block.name,
      description: block.description,
      app: block.logo ? block.name : undefined,
      icon: block.logo || undefined,
    };

    // Styling logic
    const nodeStyle = getNodeStyle("Action");

    if (block.name === "Start" || block.name === "Webhook") {
      nodeType = "input";
      nodeData.nodeType = "Trigger";
      Object.assign(nodeStyle, getNodeStyle("Trigger"));
    }

    const newNode = {
      id: `node_${nodeIdCounter}`,
      type: nodeType,
      data: nodeData,
      position: { x: Math.random() * 300 + 200, y: Math.random() * 300 + 100 },
      style: nodeStyle,
    };

    setNodeIdCounter(nodeIdCounter + 1);
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);

    if (connectingFrom) {
      const newEdge = {
        id: `edge_${connectingFrom}_${newNode.id}`,
        source: connectingFrom,
        target: newNode.id,
        animated: true,
        type: "smoothstep",
        markerEnd: { type: MarkerType.ArrowClosed, color: "#64748b" },
        style: { stroke: "#64748b", strokeWidth: 2 },
      };
      const newEdges = [...edges, newEdge];
      setEdges(newEdges);
      saveHistory(newNodes, newEdges);
      setConnectingFrom(null);
    } else {
      saveHistory(newNodes, edges);
    }

    setShowBlockSelector(false);
    setSearchQuery("");
  };

  const deleteNode = (nodeId) => {
    const newNodes = nodes.filter((n) => n.id !== nodeId);
    const newEdges = edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );
    setNodes(newNodes);
    setEdges(newEdges);
    setSelectedNode(null);
  };

  const duplicateNode = (node) => {
    const newNode = {
      ...node,
      id: `node_${nodeIdCounter}`,
      position: { x: node.position.x + 50, y: node.position.y + 50 },
    };
    setNodeIdCounter(nodeIdCounter + 1);
    const newNodes = [...nodes, newNode];
    setNodes(newNodes);
    saveHistory(newNodes, edges);
  };

  const onNodeClick = useCallback((event, node) => setSelectedNode(node), []);

  return (
    <div className="h-screen flex flex-col bg-[#0B0D14] overflow-hidden text-gray-100 font-sans">
      {/* Header */}
      <div className="h-14 bg-[#111827] border-b border-[#1f2937] flex items-center justify-between px-4 flex-shrink-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/workflows")}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>
          <div className="h-6 w-px bg-[#374151]" />
          <input
            type="text"
            value={workflowName}
            onChange={(e) => setWorkflowName(e.target.value)}
            className="bg-transparent border-none text-sm font-medium text-white focus:ring-0 p-0 w-64 placeholder-gray-500"
          />
        </div>

        {/* Right side simple actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="text-sm font-medium text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          <button className="p-2 hover:bg-[#1f2937] rounded-full transition text-gray-400">
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
        <button
          onClick={() => setIsCopilotOpen(!isCopilotOpen)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition border ${isCopilotOpen
              ? "bg-indigo-600/20 border-indigo-500/50 text-indigo-300"
              : "bg-[#1f2937] border-[#374151] text-gray-400"
            }`}
        >
          <Sparkles className="w-4 h-4" />
          {isCopilotOpen ? "Copilot Active" : "Enable Copilot"}
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* --- AI COPILOT SIDEBAR --- */}
        <AnimatePresence mode="wait">
          {isCopilotOpen && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-[#111827] border-r border-[#1f2937] flex flex-col z-10"
            >
              <div className="p-4 border-b border-[#1f2937] flex items-center justify-between bg-[#111827]">
                <div className="flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <h3 className="font-semibold text-white">AI Builder</h3>
                </div>
                <button
                  onClick={() => setIsCopilotOpen(false)}
                  className="text-gray-500 hover:text-white"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </div>
              <div
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0D14] [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""
                      }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === "ai" ? "bg-indigo-600" : "bg-gray-700"
                        }`}
                    >
                      {msg.role === "ai" ? (
                        <Bot className="w-4 h-4 text-white" />
                      ) : (
                        <div className="text-xs font-bold text-white">U</div>
                      )}
                    </div>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${msg.role === "ai"
                          ? "bg-[#1f2937] text-gray-200 rounded-tl-none"
                          : "bg-indigo-600 text-white rounded-tr-none"
                        }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isAiTyping && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-[#1f2937] px-4 py-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-100" />
                      <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-200" />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Quick Actions Chips (RESTORED) */}
              <div
                className="px-4 py-2 flex gap-2 overflow-x-auto border-t border-[#1f2937] bg-[#111827] [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {[
                  "Connect GitHub",
                  "Send Email",
                  "Add Slack",
                  "Create Notion Page",
                ].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleQuickAction(action)}
                    className="whitespace-nowrap px-3 py-1 bg-[#1f2937] hover:bg-[#374151] border border-[#374151] rounded-full text-xs text-gray-300 transition"
                  >
                    {action}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-[#111827] border-t border-[#1f2937]">
                <form onSubmit={handleSendMessage} className="relative">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Describe what to build..."
                    className="w-full bg-[#1f2937] border border-[#374151] text-white rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- CANVAS --- */}
        <div className="flex-1 relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
          ) : (
            <>
              {" "}
              {!isCopilotOpen && (
                <button
                  onClick={() => setIsCopilotOpen(true)}
                  className="absolute top-4 left-4 z-10 p-2 bg-[#1f2937] border border-[#374151] rounded-lg text-gray-400 hover:text-white shadow-lg"
                >
                  <PanelLeftOpen className="w-5 h-5" />
                </button>
              )}
              <ReactFlowProvider>
                <WorkflowCanvasInner
                  nodes={nodes}
                  edges={edges}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  onConnect={onConnect}
                  onNodeClick={onNodeClick}
                  undo={undo}
                  redo={redo}
                  historyIndex={historyIndex}
                  history={history}
                  openBlockSelector={() => setShowBlockSelector(true)}
                  showBlockSelector={showBlockSelector}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  filteredBlocks={filteredBlocks}
                  addBlockFromSelector={addBlockFromSelector}
                  setShowBlockSelector={setShowBlockSelector}
                  onRun={handleRun}
                />
              </ReactFlowProvider>
            </>
          )}
        </div>

        {/* --- RIGHT SIDEBAR: NODE SETTINGS --- */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div
              initial={{ x: 320 }}
              animate={{ x: 0 }}
              exit={{ x: 320 }}
              className="w-96 bg-[#111827] border-l border-[#1f2937] flex flex-col flex-shrink-0 z-20 shadow-2xl"
            >
              <div className="p-5 border-b border-[#1f2937] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-orange-600 rounded-md">
                    <SettingsIcon className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    Node Settings
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-gray-500 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div
                className="p-5 overflow-y-auto space-y-6 [&::-webkit-scrollbar]:hidden"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {/* 1. Basic Info */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Node Name
                  </label>
                  <input
                    type="text"
                    value={selectedNode.data.label}
                    onChange={(e) => {
                      const updated = nodes.map((n) =>
                        n.id === selectedNode.id
                          ? { ...n, data: { ...n.data, label: e.target.value } }
                          : n
                      );
                      setNodes(updated);
                    }}
                    className="w-full px-3 py-2.5 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500 transition"
                  />
                </div>

                {/* 2. Connected App Display */}
                {selectedNode.data.app && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Connected App
                    </label>
                    <div className="p-4 bg-[#1f2937] border border-[#374151] rounded-xl flex items-center gap-4">
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center bg-[#111827] rounded-lg border border-[#374151]">
                        {selectedNode.data.icon ? (
                          <AppLogos
                            name={selectedNode.data.icon}
                            className="w-6 h-6"
                          />
                        ) : (
                          <Zap className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">
                          {selectedNode.data.app}
                        </div>
                        <div className="text-xs text-green-400 mt-0.5 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> Connected
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. DYNAMIC CONFIGURATION FORM */}
                {selectedNode.data.app && (
                  <div className="pt-2 border-t border-[#374151] mt-2">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-4">
                      Configuration
                    </h4>
                    <div className="mb-4">
                      <label className="block text-xs text-gray-400 mb-1.5">
                        Select Account
                      </label>
                      <div className="flex items-center justify-between px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg">
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-gray-400" />
                          </div>
                          <span className="text-sm text-white">
                            Admin Account
                          </span>
                        </div>
                        <ChevronUp className="w-4 h-4 text-gray-500 rotate-180" />
                      </div>
                    </div>
                    {selectedNode.data.app.toLowerCase().includes("mail") ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">
                            To (Recipient)
                          </label>
                          <input
                            type="text"
                            placeholder="name@example.com"
                            className="w-full px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">
                            Subject
                          </label>
                          <input
                            type="text"
                            placeholder="Enter subject line"
                            className="w-full px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">
                            Body
                          </label>
                          <textarea
                            rows={4}
                            placeholder="Email content..."
                            className="w-full px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                          />
                        </div>
                      </div>
                    ) : selectedNode.data.app.toLowerCase().includes("slack") ||
                      selectedNode.data.app
                        .toLowerCase()
                        .includes("discord") ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">
                            Channel
                          </label>
                          <select className="w-full px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white focus:outline-none focus:border-orange-500">
                            <option>#general</option>
                            <option>#random</option>
                            <option>#alerts</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">
                            Message Text
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Type your message..."
                            className="w-full px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500 resize-none"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1.5">
                            Action Input
                          </label>
                          <input
                            type="text"
                            placeholder="Enter value..."
                            className="w-full px-3 py-2 bg-[#1f2937] border border-[#374151] rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 4. Advanced & Delete */}
                <div className="pt-2 border-t border-[#374151] mt-2">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 mt-2">
                    Advanced
                  </h4>
                  <div className="flex items-center justify-between p-3 bg-[#1f2937] border border-[#374151] rounded-lg mb-3">
                    <span className="text-sm font-medium text-gray-300">
                      Retry on Failure
                    </span>
                    <input
                      type="checkbox"
                      defaultChecked
                      className="w-4 h-4 text-orange-600 bg-[#111827] border-gray-600 rounded focus:ring-orange-500 focus:ring-2"
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => deleteNode(selectedNode.id)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-900/20 text-red-400 font-medium rounded-lg hover:bg-red-900/40 transition border border-red-900/30 w-full"
                  >
                    <Trash2 className="w-4 h-4" /> Delete Node
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
