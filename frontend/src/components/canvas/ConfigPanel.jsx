import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Settings, Trash2, Copy, CheckCircle, Zap,
  ChevronDown, User, RefreshCw, SkipForward, AlertTriangle,
  Terminal, Shield, Activity, Cpu, Play, Search, Code, 
  MessageCircle, Plus
} from 'lucide-react';
import { API_BASE } from '../../lib/api';

const nodeOutputs = {
  'Webhook': ['Payload', 'Headers', 'Query_Params', 'Sender_IP'],
  'HTTP Request': ['Response_Body', 'Status_Code', 'Headers', 'Request_Time'],
  'Gmail': ['Email_Body', 'Sender', 'Subject', 'Attachment_Count'],
  'Slack': ['Message_TS', 'Channel_ID', 'Sender_User'],
  'GitHub': ['Issue_URL', 'Issue_ID', 'Status'],
  'Notion': ['Page_ID', 'URL', 'Created_Time'],
  'Google Drive': ['File_ID', 'File_URL', 'Size_Bytes'],
  'Google Calendar': ['Event_ID', 'Event_URL'],
  'Google Meet': ['Event_ID', 'Event_URL', 'Meet_URL'],
  'Google Docs': ['Document_ID', 'Document_URL'],
  'Google Keep': ['Note_ID', 'Note_Title', 'Note_Text', 'Create_Time'],
  'Discord': ['Message_ID', 'Channel_ID', 'Author'],
  'Database Query': ['Result_Set', 'Row_Count', 'Execution_Time'],
  'AI Agent': ['Agent_Response', 'Confidence_Score', 'Tokens_Used'],
};

const errorStrategies = [
  { id: 'retry', label: 'Retry_Execution', desc: 'Attempt again after 30s delay', icon: RefreshCw },
  { id: 'stop', label: 'Halt_Pipeline', desc: 'Stop all downstream nodes immediately', icon: X },
  { id: 'skip', label: 'Bypass_Module', desc: 'Continue to next node with null data', icon: SkipForward },
];

export const ConfigPanel = ({
  selectedNode,
  onClose,
  onUpdateNode,
  onDeleteNode,
  onDuplicateNode,
  allNodes = [], 
  nodeSamples = {},
  onTestStep = () => {},
  appDirectory = [],
  workflowId = '',
  onRefreshConnections = () => {},
}) => {
  const [showVariablePicker, setShowVariablePicker] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [activeTab, setActiveTab] = useState('SETUP');

  if (!selectedNode) return null;

  const { data } = selectedNode;
  const nodeLabel = String(data.label || '').toUpperCase();
  const errorStrategy = data?.errorStrategy || 'retry';
  const authToken = typeof window !== 'undefined' ? localStorage.getItem('token') : '';

  const nodeAppKeyMap = {
    GMAIL: 'gmail',
    SLACK: 'slack',
    NOTION: 'notion',
    'GOOGLE CALENDAR': 'google_calendar',
    'GOOGLE MEET': 'google_meet',
    'GOOGLE DRIVE': 'google_drive',
    'GOOGLE DOCS': 'google_docs',
    'GOOGLE KEEP': 'google_keep',
    CALENDLY: 'calcom',
  };

  const appKey = nodeAppKeyMap[nodeLabel] || '';
  const appStatus = appDirectory.find((app) => app.key === appKey) || null;
  const isConnected = Boolean(appStatus?.connected);
  const connectedAccount = appStatus?.connectedAccount || appStatus?.publicData?.teamName || '';

  const getConnectUrl = () => {
    const redirectPath = workflowId ? `/workflows/builder/${workflowId}` : '/workflows/builder';
    const tokenQuery = authToken ? `&token=${encodeURIComponent(authToken)}` : '';
    if (appKey === 'gmail' || appKey === 'google_calendar' || appKey === 'google_meet' || appKey === 'google_drive' || appKey === 'google_docs' || appKey === 'google_keep') {
      return `${API_BASE}/api/v1/auth/google?redirect=${encodeURIComponent(redirectPath)}`;
    }
    if (appKey === 'slack') {
      return `${API_BASE}/api/apps/slack/connect?redirect=${encodeURIComponent(redirectPath)}${tokenQuery}`;
    }
    if (appKey === 'notion') {
      return `${API_BASE}/api/apps/notion/connect?redirect=${encodeURIComponent(redirectPath)}${tokenQuery}`;
    }
    return '';
  };

  const handleLabelChange = (e) => {
    onUpdateNode(selectedNode.id, { ...data, label: e.target.value.toUpperCase() });
  };

  const handleStrategyChange = (strategyId) => {
    onUpdateNode(selectedNode.id, { ...data, errorStrategy: strategyId });
  };

  const insertVariable = (nodeId, variable) => {
    const varString = `{{${nodeId}.${variable}}}`;
    if (activeField) {
      const currentVal = data[activeField] || '';
      onUpdateNode(selectedNode.id, { ...data, [activeField]: currentVal + varString });
    }
    setShowVariablePicker(false);
  };

  return (
    <AnimatePresence>
      {selectedNode && (
        <motion.div
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          className="w-[360px] flex flex-col bg-surface-1 border-l border-white/[0.05] z-20 shrink-0 relative"
        >
          {/* Header */}
          <div className="px-6 pt-5 border-b border-white/[0.05]">
            <div className="flex items-center justify-between mb-4">
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
              <button onClick={onClose} className="text-white/20 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-6">
              {['SETUP', 'TEST', 'ADVANCED'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-[10px] font-black tracking-widest transition-all border-b-2 ${activeTab === tab ? 'text-accent border-accent' : 'text-white/20 border-transparent hover:text-white/40'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 scrollbar-hide">
            {activeTab === 'SETUP' && (
              <>
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

                {appKey && (
                  <div className="space-y-3 pt-6 border-t border-white/[0.03]">
                    <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                      Integration_Access
                    </label>
                    <div className={`p-3 border ${isConnected ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-black uppercase tracking-widest ${isConnected ? 'text-emerald-300' : 'text-amber-300'}`}>
                          {isConnected ? 'Connected' : 'Not Connected'}
                        </span>
                        <button
                          onClick={onRefreshConnections}
                          className="text-[8px] font-mono uppercase tracking-widest text-white/50 hover:text-white"
                        >
                          Refresh
                        </button>
                      </div>
                      {connectedAccount && (
                        <p className="mt-2 text-[8px] font-mono uppercase tracking-widest text-white/50">
                          Account: {connectedAccount}
                        </p>
                      )}
                      {getConnectUrl() && (
                        <a
                          href={getConnectUrl()}
                          className="mt-3 inline-flex w-full items-center justify-center gap-2 bg-white text-black py-2 text-[9px] font-black uppercase tracking-widest hover:bg-accent hover:text-white transition-colors"
                        >
                          {isConnected ? 'Switch Account' : 'Connect Now'}
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Parameters */}
                <div className="space-y-3 pt-6 border-t border-white/[0.03]">
                  <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">
                    Data_Mapping
                  </label>

                  <div className="space-y-4">
                    {(() => {
                      const fields = {
                        'GITHUB': [
                          { id: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' },
                          { id: 'title', label: 'Issue Title', type: 'text', placeholder: 'Bug: ...' },
                          { id: 'body', label: 'Issue Body', type: 'textarea', placeholder: 'Details...' }
                        ],
                        'HTTP REQUEST': [
                          { id: 'url', label: 'Request URL', type: 'text', placeholder: 'https://api.example.com/endpoint' },
                          { id: 'method', label: 'Method', type: 'text', placeholder: 'POST' },
                          { id: 'headers', label: 'Headers JSON', type: 'textarea', placeholder: '{"Authorization":"Bearer ..."}' },
                          { id: 'payload', label: 'Body JSON', type: 'textarea', placeholder: '{"name":"{{node_0.Payload}}"}' }
                        ],
                        'GMAIL': [
                          { id: 'action', label: 'Action', type: 'select', options: [
                            { value: 'send', label: 'SEND VIA MAIL ENGINE' },
                            { value: 'send_google', label: 'SEND VIA GMAIL API' },
                            { value: 'read_latest', label: 'READ LATEST EMAIL' },
                            { value: 'auto_reply', label: 'AUTO REPLY TO LATEST' },
                          ] },
                          { id: 'query', label: 'Gmail Search Query', type: 'text', placeholder: 'is:unread newer_than:7d' },
                          { id: 'to', label: 'To Email', type: 'text', placeholder: 'user@example.com' },
                          { id: 'subject', label: 'Subject', type: 'text', placeholder: 'Hello' },
                          { id: 'body', label: 'Body', type: 'textarea', placeholder: 'Message...' }
                        ],
                        'SLACK': [
                          { id: 'channel', label: 'Channel ID', type: 'text', placeholder: 'C12345' },
                          { id: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'Optional if saved in Apps' },
                          { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Hello team!' }
                        ],
                        'NOTION': [
                          { id: 'token', label: 'Notion Token', type: 'text', placeholder: 'Optional if saved in Apps' },
                          { id: 'database_id', label: 'Database ID', type: 'text', placeholder: 'abc123def456' },
                          { id: 'page_title', label: 'Page Title', type: 'text', placeholder: 'New Task' },
                          { id: 'content', label: 'Content', type: 'textarea', placeholder: 'Page content...' }
                        ],
                        'GOOGLE DRIVE': [
                          { id: 'folder_id', label: 'Folder ID', type: 'text', placeholder: 'root' },
                          { id: 'file_name', label: 'File Name', type: 'text', placeholder: 'document.txt' },
                          { id: 'content', label: 'Content', type: 'textarea', placeholder: 'File contents...' }
                        ],
                        'GOOGLE CALENDAR': [
                          { id: 'action', label: 'Action', type: 'select', options: [
                            { value: 'create_event', label: 'CREATE EVENT' },
                            { value: 'check_availability', label: 'CHECK AVAILABILITY' },
                          ] },
                          { id: 'title', label: 'Event Title', type: 'text', placeholder: 'Follow-up call' },
                          { id: 'start', label: 'Start ISO Time', type: 'text', placeholder: '2026-04-27T10:00:00+05:30' },
                          { id: 'end', label: 'End ISO Time', type: 'text', placeholder: '2026-04-27T10:30:00+05:30' },
                          { id: 'attendees', label: 'Attendees', type: 'text', placeholder: 'a@example.com,b@example.com' },
                          { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Agenda...' }
                        ],
                        'GOOGLE MEET': [
                          { id: 'title', label: 'Meeting Title', type: 'text', placeholder: 'Urgent review' },
                          { id: 'start', label: 'Start ISO Time', type: 'text', placeholder: '2026-04-27T10:00:00+05:30' },
                          { id: 'end', label: 'End ISO Time', type: 'text', placeholder: '2026-04-27T10:30:00+05:30' },
                          { id: 'attendees', label: 'Attendees', type: 'text', placeholder: 'a@example.com,b@example.com' },
                          { id: 'description', label: 'Description', type: 'textarea', placeholder: 'Meet agenda...' }
                        ],
                        'GOOGLE DOCS': [
                          { id: 'title', label: 'Document Title', type: 'text', placeholder: 'AI drafted reply' },
                          { id: 'content', label: 'Document Content', type: 'textarea', placeholder: 'Write or map generated text...' }
                        ],
                        'GOOGLE KEEP': [
                          { id: 'action', label: 'Action', type: 'select', options: [
                            { value: 'create_note', label: 'CREATE NOTE' },
                            { value: 'list_recent', label: 'LIST RECENT NOTES' },
                          ] },
                          { id: 'title', label: 'Note Title', type: 'text', placeholder: 'Client follow-up' },
                          { id: 'content', label: 'Note Content', type: 'textarea', placeholder: 'Summarized notes...' },
                          { id: 'pageSize', label: 'List Page Size', type: 'text', placeholder: '10' }
                        ],
                        'DISCORD': [
                          { id: 'webhook_url', label: 'Webhook URL', type: 'text', placeholder: 'https://discord.com/api/webhooks/...' },
                          { id: 'message', label: 'Message', type: 'textarea', placeholder: 'Hello server!' }
                        ],
                        'AI AGENT': [
                          { id: 'prompt', label: 'Agent Instructions', type: 'textarea', placeholder: 'Analyze the request, draft a reply, and explain escalation priority.' },
                          { id: 'notion_query', label: 'Notion KB Search', type: 'text', placeholder: 'Optional: refund policy, onboarding docs, SLA...' }
                        ],
                        'DELAY': [
                          { id: 'delayMs', label: 'Delay Milliseconds', type: 'text', placeholder: '1000' }
                        ]
                      };

                      const currentFields = fields[nodeLabel] || [{ id: 'payload', label: 'Input Payload', type: 'textarea', placeholder: 'Enter data or map variables...' }];

                      return currentFields.map(field => (
                        <div key={field.id}>
                          <label className="block text-[8px] font-mono text-white/20 mb-2 uppercase tracking-widest">{field.label}</label>
                          <div className="relative group">
                            {field.type === 'select' ? (
                              <select
                                value={data[field.id] || field.options?.[0]?.value || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { ...data, [field.id]: e.target.value })}
                                className="w-full bg-surface-2 border border-white/5 p-3 text-[10px] font-mono text-white/60 focus:outline-none focus:border-accent/40"
                              >
                                {(field.options || []).map(option => (
                                  <option key={option.value} value={option.value}>{option.label}</option>
                                ))}
                              </select>
                            ) : field.type === 'textarea' ? (
                              <textarea 
                                value={data[field.id] || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { ...data, [field.id]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full h-24 bg-surface-2 border border-white/5 p-3 text-[10px] font-mono text-white/60 placeholder-white/10 focus:outline-none focus:border-accent/40 resize-none"
                              />
                            ) : (
                              <input 
                                type="text"
                                value={data[field.id] || ''}
                                onChange={(e) => onUpdateNode(selectedNode.id, { ...data, [field.id]: e.target.value })}
                                placeholder={field.placeholder}
                                className="w-full bg-surface-2 border border-white/5 p-3 text-[10px] font-mono text-white/60 placeholder-white/10 focus:outline-none focus:border-accent/40"
                              />
                            )}
                            <button 
                              onClick={() => { setActiveField(field.id); setShowVariablePicker(true); }}
                              className="absolute bottom-2 right-2 p-1.5 bg-surface-3 border border-white/10 hover:bg-accent/20 hover:border-accent/40 transition-all text-white/40 hover:text-accent"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>

                {/* Context-specific fields based on Label */}
                <div className="space-y-6 pt-6 border-t border-white/[0.03]">
                  {nodeLabel === 'FORMATTER' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[8px] font-mono text-white/20 mb-2 uppercase tracking-widest">Transform_Type</label>
                        <select 
                          value={data.formatterType || 'text'}
                          onChange={(e) => onUpdateNode(selectedNode.id, { ...data, formatterType: e.target.value })}
                          className="w-full bg-surface-2 border border-white/5 p-3 text-[10px] font-mono text-white focus:outline-none focus:border-accent/40"
                        >
                          <option value="text">TEXT_TRANSFORM</option>
                          <option value="number">MATH_OPERATIONS</option>
                          <option value="date">DATE_TIME_FORMAT</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[8px] font-mono text-white/20 mb-2 uppercase tracking-widest">Operation</label>
                        <select 
                          value={data.operation || 'uppercase'}
                          onChange={(e) => onUpdateNode(selectedNode.id, { ...data, operation: e.target.value })}
                          className="w-full bg-surface-2 border border-white/5 p-3 text-[10px] font-mono text-white focus:outline-none focus:border-accent/40"
                        >
                          {data.formatterType === 'text' && (
                            <>
                              <option value="uppercase">TO_UPPERCASE</option>
                              <option value="lowercase">TO_LOWERCASE</option>
                              <option value="split">SPLIT_TEXT</option>
                              <option value="replace">FIND_REPLACE</option>
                            </>
                          )}
                          {data.formatterType === 'number' && (
                            <>
                              <option value="add">ADDITION</option>
                              <option value="subtract">SUBTRACTION</option>
                              <option value="multiply">MULTIPLICATION</option>
                            </>
                          )}
                          {data.formatterType === 'date' && (
                            <>
                              <option value="format">REFORMAT_DATE</option>
                              <option value="add_time">ADD_TIME</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>
                  )}

                  {nodeLabel === 'FILTER' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[8px] font-mono text-white/20 mb-2 uppercase tracking-widest">Condition_Logic</label>
                        <div className="grid grid-cols-2 gap-2">
                           {['MATCHES', 'CONTAINS', 'EXISTS', 'GREATER_THAN'].map(opt => (
                             <button 
                               key={opt}
                               onClick={() => onUpdateNode(selectedNode.id, { ...data, condition: opt })}
                               className={`p-2 border text-[8px] font-mono transition-all ${data.condition === opt ? 'bg-accent/10 border-accent/40 text-white' : 'bg-white/[0.01] border-white/5 text-white/20'}`}
                             >
                               {opt}
                             </button>
                           ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {activeTab === 'TEST' && (
              <div className="space-y-8">
                <div className="p-6 bg-accent/5 border border-accent/20">
                  <div className="flex items-center gap-3 mb-4">
                    <Play className="w-4 h-4 text-accent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">Live_Sandbox</span>
                  </div>
                  <p className="text-[9px] font-mono text-white/40 uppercase tracking-widest leading-relaxed mb-6">
                    Run this specific step with the mapped variables to verify the output payload.
                  </p>
                  <button onClick={() => onTestStep(selectedNode.id)} className="w-full py-3 bg-accent text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-accent-dim transition-all shadow-[0_0_20px_rgba(255,95,31,0.2)]">
                    Trigger_Test_Run
                  </button>
                </div>

                <div className="space-y-3">
                   <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Latest_Response</label>
                   <div className="bg-surface-2 border border-white/5 p-4 min-h-[120px] flex items-center justify-center">
                     {nodeSamples[selectedNode.id] ? (
                       <pre className="text-[9px] font-mono text-white/60 text-left w-full overflow-x-auto">
                         {JSON.stringify(nodeSamples[selectedNode.id], null, 2)}
                       </pre>
                     ) : (
                       <span className="text-[9px] font-mono text-white/10 uppercase tracking-widest">No_Test_Data_Detected</span>
                     )}
                   </div>
                </div>
              </div>
            )}

            {activeTab === 'ADVANCED' && (
              <div className="space-y-8">
                {/* Error Strategy */}
                <div className="space-y-4">
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

                <div className="space-y-3 pt-6 border-t border-white/[0.03]">
                  <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.4em]">Metadata</label>
                  <div className="p-4 bg-white/[0.02] border border-white/5 rounded">
                    <div className="flex justify-between text-[8px] font-mono text-white/20 uppercase">
                      <span>Latency_Opt</span>
                      <span>High_Priority</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Variable Picker Overlay */}
            <AnimatePresence>
              {showVariablePicker && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="absolute inset-x-0 bottom-0 top-[20%] bg-surface-1 border-t border-white/10 z-30 p-6 flex flex-col shadow-[0_-20px_50px_rgba(0,0,0,0.5)]"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Map_Variables</h4>
                    <button onClick={() => setShowVariablePicker(false)}><X className="w-3.5 h-3.5 text-white/20 hover:text-white" /></button>
                  </div>
                  <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                    {allNodes.filter(n => n.id !== selectedNode.id).map(node => (
                      <div key={node.id} className="space-y-1">
                        <div className="flex items-center gap-2 mb-2">
                           <div className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                           <span className="text-[9px] font-black uppercase tracking-widest text-white/40">{node.data.label} ({node.id})</span>
                        </div>
                        <div className="grid grid-cols-1 gap-1">
                           {(nodeOutputs[node.data.label] || ['Result', 'Status']).map(v => (
                             <button 
                               key={v}
                               onClick={() => insertVariable(node.id, v)}
                               className="p-2 bg-white/[0.02] border border-white/[0.05] hover:bg-accent/5 hover:border-accent/30 text-[8px] font-mono text-white/40 hover:text-white text-left transition-all flex justify-between items-center group"
                             >
                               <span className="truncate max-w-[50%]">{v}</span>
                               <span className="truncate max-w-[45%] text-[7px] text-white/20 italic group-hover:text-accent/60">
                                 {nodeSamples[node.id]?.[v] || '...'}
                               </span>
                             </button>
                           ))}
                        </div>
                      </div>
                    ))}
                    {allNodes.length <= 1 && (
                      <div className="text-center py-12 text-[9px] font-mono text-white/10 uppercase tracking-widest">
                        No previous modules detected
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
