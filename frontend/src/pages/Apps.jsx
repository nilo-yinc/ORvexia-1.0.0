import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Search, Grid, Terminal, CheckCircle2, Lock, ExternalLink, Loader2,
  X, Mail, Send, Tag, FileText, Bell, Zap, ArrowRight, LogIn, LogOut,
  RefreshCw, ChevronRight, Shield, User, Clock, Play, GitFork
} from 'lucide-react';
import { appsApi, API_BASE } from '../lib/api';
import { AppLogos } from './AppLogos';
import { useAuth } from '../context/AuthContext';

const APP_CATEGORIES = ['ALL_APPS', 'GOOGLE', 'COMMUNICATION', 'PRODUCTIVITY', 'CALENDAR', 'BETA'];

const credentialFields = {
  calcom: [{ key: 'apiKey', label: 'Cal.com API Key', placeholder: 'cal_live_...' }],
  whatsapp: [
    { key: 'accessToken', label: 'WhatsApp Access Token', placeholder: 'EAAG...' },
    { key: 'phoneNumberId', label: 'Phone Number ID', placeholder: '1234567890' },
    { key: 'businessAccountId', label: 'Business Account ID', placeholder: '1122334455' },
    { key: 'verifyToken', label: 'Webhook Verify Token', placeholder: 'any-secure-string' },
  ],
};

// App detail configs: triggers, actions, templates
const APP_DETAILS = {
  gmail: {
    description: 'Send and receive emails, manage labels, and automate email workflows.',
    triggers: [
      { id: 'new_email', name: 'New Email', icon: Mail, desc: 'Triggers when a new email is received' },
      { id: 'new_attachment', name: 'New Attachment', icon: FileText, desc: 'Triggers when an email with attachment arrives' },
      { id: 'new_labeled', name: 'New Labeled Email', icon: Tag, desc: 'Triggers when an email gets a specific label' },
    ],
    actions: [
      { id: 'send_email', name: 'Send Email', icon: Send, desc: 'Send an email to one or more recipients' },
      { id: 'create_draft', name: 'Create Draft', icon: FileText, desc: 'Create a draft email' },
      { id: 'add_label', name: 'Add Label', icon: Tag, desc: 'Add a label to an email' },
    ],
    templates: [
      { name: 'Gmail → Slack', desc: 'Forward new emails to a Slack channel', apps: ['Gmail', 'Slack'] },
      { name: 'Gmail → Google Drive', desc: 'Save email attachments to Drive', apps: ['Gmail', 'Google Drive'] },
      { name: 'Gmail → Notion', desc: 'Log emails to a Notion database', apps: ['Gmail', 'Notion'] },
    ]
  },
  slack: {
    description: 'Send messages, manage channels, and automate team notifications.',
    triggers: [
      { id: 'new_message', name: 'New Message', icon: Mail, desc: 'Triggers when a new message is posted' },
      { id: 'new_mention', name: 'New Mention', icon: Bell, desc: 'Triggers when you are mentioned' },
    ],
    actions: [
      { id: 'send_message', name: 'Send Message', icon: Send, desc: 'Post a message to a channel' },
      { id: 'send_dm', name: 'Send DM', icon: Mail, desc: 'Send a direct message' },
    ],
    templates: [
      { name: 'Slack → Gmail', desc: 'Forward Slack messages via email', apps: ['Slack', 'Gmail'] },
      { name: 'GitHub → Slack', desc: 'Post GitHub events to Slack', apps: ['GitHub', 'Slack'] },
    ]
  },
  github: {
    description: 'Track repositories, PRs, and issues from your automations.',
    triggers: [
      { id: 'new_issue', name: 'New Issue', icon: FileText, desc: 'Triggers when a new issue is created' },
      { id: 'new_pr', name: 'New Pull Request', icon: GitFork, desc: 'Triggers on new pull requests' },
    ],
    actions: [
      { id: 'create_issue', name: 'Create Issue', icon: FileText, desc: 'Create a GitHub issue from workflow data' },
      { id: 'comment_pr', name: 'Comment on PR', icon: Send, desc: 'Post a comment to a pull request' },
    ],
    templates: [
      { name: 'GitHub → Slack', desc: 'Notify Slack when new issues are created', apps: ['GitHub', 'Slack'] },
      { name: 'Gmail → GitHub', desc: 'Create GitHub issues from support emails', apps: ['Gmail', 'GitHub'] },
    ]
  },
  whatsapp: {
    description: 'Send WhatsApp notifications and automate business alerts.',
    triggers: [
      { id: 'incoming_message', name: 'Incoming Message', icon: Mail, desc: 'Triggers when a customer sends a message' },
    ],
    actions: [
      { id: 'send_message', name: 'Send WhatsApp Message', icon: Send, desc: 'Send message to a WhatsApp number' },
      { id: 'send_template', name: 'Send Template Message', icon: FileText, desc: 'Send approved template messages' },
    ],
    templates: [
      { name: 'Gmail → WhatsApp', desc: 'Send WhatsApp alert for important Gmail emails', apps: ['Gmail', 'WhatsApp'] },
      { name: 'Slack → WhatsApp', desc: 'Forward urgent Slack messages to WhatsApp', apps: ['Slack', 'WhatsApp'] },
    ]
  },
  google_calendar: {
    description: 'Create events, manage calendars, and get meeting notifications.',
    triggers: [{ id: 'new_event', name: 'New Event', icon: Clock, desc: 'Triggers on new calendar event' }],
    actions: [{ id: 'create_event', name: 'Create Event', icon: Zap, desc: 'Create a new calendar event' }],
    templates: [{ name: 'Calendar → Slack', desc: 'Notify Slack about new meetings', apps: ['Google Calendar', 'Slack'] }]
  },
  google_keep: {
    description: 'Create and organize Google Keep notes from your automated workflows.',
    triggers: [{ id: 'new_note', name: 'New Note', icon: FileText, desc: 'Triggers when a new note is created' }],
    actions: [
      { id: 'create_note', name: 'Create Note', icon: FileText, desc: 'Create a text note in Google Keep' },
      { id: 'list_notes', name: 'List Recent Notes', icon: Search, desc: 'Fetch recent notes for downstream steps' },
    ],
    templates: [
      { name: 'Gmail → Google Keep', desc: 'Save incoming email summaries as notes', apps: ['Gmail', 'Google Keep'] },
      { name: 'AI Agent → Google Keep', desc: 'Store AI outputs as structured notes', apps: ['AI Agent', 'Google Keep'] },
    ]
  },
  notion: {
    description: 'Create pages, update databases, and sync your workspace.',
    triggers: [{ id: 'new_page', name: 'New Page', icon: FileText, desc: 'Triggers when a new page is created' }],
    actions: [{ id: 'create_page', name: 'Create Page', icon: FileText, desc: 'Create a new page in a database' }],
    templates: [{ name: 'Gmail → Notion', desc: 'Log emails to Notion', apps: ['Gmail', 'Notion'] }]
  },
};

// Fallback details for apps without specific configs
const defaultDetails = {
  description: 'Configure fields directly inside workflow steps.',
  triggers: [{ id: 'trigger', name: 'Default Trigger', icon: Zap, desc: 'Triggers on new event' }],
  actions: [{ id: 'action', name: 'Default Action', icon: Play, desc: 'Perform an action' }],
  templates: []
};

const getAuthTokenQuery = () => {
  try {
    const token = localStorage.getItem('token');
    return token ? `&token=${encodeURIComponent(token)}` : '';
  } catch { return ''; }
};

// ---------- APP DETAIL PANEL ----------
const AppDetailPanel = ({ app, onClose, navigate, onConnectionSaved, user }) => {
  if (!app) return null;
  const details = APP_DETAILS[app.key] || defaultDetails;
  const isGoogle = app.credentialMode === 'google_oauth' || app.key === 'gmail';
  const isSlack = app.credentialMode === 'slack_oauth';
  const isNotion = app.credentialMode === 'notion_oauth';
  const isGitHub = app.credentialMode === 'github_oauth' || app.key === 'github';
  const manualCredentialFields = credentialFields[app.key] || [];
  const hasManualCredentials = manualCredentialFields.length > 0;
  const authTokenQuery = getAuthTokenQuery();
  const [formData, setFormData] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    const initialValues = {};
    for (const field of manualCredentialFields) initialValues[field.key] = '';
    setFormData(initialValues);
    setSaveMessage('');
  }, [app.key]);

  const getConnectUrl = () => {
    if (isGoogle || app.key === 'gmail') return `${API_BASE}/api/v1/auth/google?redirect=${encodeURIComponent('/apps')}`;
    if (isSlack) return `${API_BASE}/api/apps/slack/connect?redirect=${encodeURIComponent('/apps')}${authTokenQuery}`;
    if (isNotion) return `${API_BASE}/api/apps/notion/connect?redirect=${encodeURIComponent('/apps')}${authTokenQuery}`;
    if (isGitHub) return `${API_BASE}/api/apps/github/connect?redirect=${encodeURIComponent('/apps')}${authTokenQuery}`;
    return null;
  };

  const handleSaveCredentials = async (event) => {
    event.preventDefault();
    if (!hasManualCredentials) return;

    setIsSaving(true);
    setSaveMessage('');
    try {
      const payload = { ...formData, name: `${app.name} connection` };
      await appsApi.saveConnection(app.key, payload);
      await onConnectionSaved(app.key);
      setSaveMessage('Connected successfully.');
    } catch (error) {
      const message = error?.response?.data?.message || 'Could not save connection.';
      setSaveMessage(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseTemplate = async (template) => {
    try {
      const stats = await import('../lib/api').then(m => m.workflowApi.getStats());
      const plan = String(user?.subscription?.plan || 'FREE').toUpperCase();
      const currentWorkflows = stats?.totalWorkflows || 0;
      
      const isRestricted = ['FREE', 'BASIC'].includes(plan);

      if (isRestricted && currentWorkflows >= 1) {
        alert("Your current Basic plan is limited to 1 workflow. Please upgrade to Pro or Elite to use templates.");
        navigate("/#pricing");
        return;
      }
    } catch (error) {
      console.error("Failed to verify limits:", error);
      alert("Could not verify your subscription limits. Please try again.");
      return;
    }

    const prompt = `Connect ${template.apps.join(' with ')}`;
    navigate('/workflows/builder', { state: { autoPrompt: prompt } });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-1 border border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/[0.05] sticky top-0 bg-surface-1 z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-surface-2 border border-white/10 flex items-center justify-center">
              <AppLogos name={app.name} className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-widest">{app.name}</h2>
              <p className="text-[9px] font-mono text-white/30 uppercase tracking-widest mt-1">{details.description}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Connection Status */}
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full ${app.connected ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-white/20'}`} />
              <div>
                <span className={`text-[10px] font-black uppercase tracking-widest ${app.connected ? 'text-emerald-400' : 'text-white/40'}`}>
                  {app.connected ? 'CONNECTED' : 'NOT CONNECTED'}
                </span>
                {app.connected && app.connectedAccount && (
                  <p className="text-[9px] font-mono text-white/30 mt-0.5">{app.connectedAccount}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getConnectUrl() && (
                <a
                  href={getConnectUrl()}
                  className={`flex items-center gap-2 px-4 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                    app.connected
                      ? 'bg-white/5 border border-white/10 text-white/60 hover:border-accent/40 hover:text-white'
                      : 'bg-accent text-white hover:bg-accent-dim'
                  }`}
                >
                  {app.connected ? <RefreshCw className="w-3 h-3" /> : <LogIn className="w-3 h-3" />}
                  {app.connected ? 'Change Account' : 'Sign In & Connect'}
                </a>
              )}
              {hasManualCredentials && (
                <span className="px-3 py-1.5 bg-white/5 border border-white/10 text-[8px] font-black uppercase tracking-widest text-white/50">
                  Manual Setup
                </span>
              )}
            </div>
          </div>
        </div>

        {hasManualCredentials && (
          <div className="p-6 border-b border-white/[0.05]">
            <h3 className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Lock className="w-3 h-3" /> CREDENTIALS
            </h3>
            <form onSubmit={handleSaveCredentials} className="space-y-3">
              {manualCredentialFields.map((field) => (
                <label key={field.key} className="block">
                  <span className="block text-[8px] font-mono text-white/30 uppercase tracking-widest mb-1.5">
                    {field.label}
                  </span>
                  <input
                    value={formData[field.key] || ''}
                    onChange={(e) => setFormData((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-surface-2 border border-white/10 px-3 py-2.5 text-[10px] font-mono text-white placeholder-white/15 focus:outline-none focus:border-accent/40"
                  />
                </label>
              ))}
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-[9px] font-black uppercase tracking-widest hover:bg-accent-dim disabled:opacity-60 transition-all"
                >
                  {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3 h-3" />}
                  {isSaving ? 'Saving...' : 'Save Connection'}
                </button>
                {saveMessage && (
                  <p className="text-[8px] font-mono uppercase tracking-widest text-white/50">{saveMessage}</p>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Triggers */}
        <div className="p-6 border-b border-white/[0.05]">
          <h3 className="text-[9px] font-black text-accent uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Zap className="w-3 h-3" /> TRIGGERS
          </h3>
          <div className="space-y-2">
            {details.triggers.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-surface-2 border border-white/[0.05] hover:border-accent/30 transition-all group cursor-pointer">
                <div className="w-8 h-8 flex items-center justify-center bg-surface-1 border border-white/5">
                  <t.icon className="w-3.5 h-3.5 text-white/30 group-hover:text-accent" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-wider">{t.name}</p>
                  <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{t.desc}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-accent" />
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-b border-white/[0.05]">
          <h3 className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <Play className="w-3 h-3" /> ACTIONS
          </h3>
          <div className="space-y-2">
            {details.actions.map((a) => (
              <div key={a.id} className="flex items-center gap-3 p-3 bg-surface-2 border border-white/[0.05] hover:border-white/20 transition-all group cursor-pointer">
                <div className="w-8 h-8 flex items-center justify-center bg-surface-1 border border-white/5">
                  <a.icon className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-white/70 uppercase tracking-wider">{a.name}</p>
                  <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest">{a.desc}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-white/40" />
              </div>
            ))}
          </div>
        </div>

        {/* Workflow Templates */}
        {details.templates.length > 0 && (
          <div className="p-6">
            <h3 className="text-[9px] font-black text-white/50 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Grid className="w-3 h-3" /> QUICK TEMPLATES
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {details.templates.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleUseTemplate(tpl)}
                  className="flex items-center gap-4 p-4 bg-surface-2 border border-white/[0.05] hover:border-accent/40 transition-all text-left group"
                >
                  <div className="flex items-center gap-2 shrink-0">
                    {tpl.apps.map((appName, j) => (
                      <span key={j} className="flex items-center gap-1">
                        <span className="w-7 h-7 flex items-center justify-center bg-surface-1 border border-white/10">
                          <AppLogos name={appName} className="w-3.5 h-3.5" />
                        </span>
                        {j < tpl.apps.length - 1 && <ArrowRight className="w-3 h-3 text-white/15" />}
                      </span>
                    ))}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-black text-white/70 uppercase tracking-wider group-hover:text-accent truncate">{tpl.name}</p>
                    <p className="text-[8px] font-mono text-white/20 uppercase tracking-widest truncate">{tpl.desc}</p>
                  </div>
                  <span className="px-3 py-1.5 bg-accent/10 border border-accent/20 text-accent text-[8px] font-black uppercase tracking-widest group-hover:bg-accent group-hover:text-white transition-all shrink-0">
                    USE
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

// ---------- APP CARD ----------
const AppCard = ({ app, onSelect }) => (
  <motion.div
    layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    onClick={() => onSelect(app)}
    className="group bg-white/5 backdrop-blur-xl border border-white/10 p-6 hover:border-accent/40 transition-all relative overflow-hidden cursor-pointer"
  >
    <div className="absolute inset-0 opacity-[0.03] surface-dot-grid pointer-events-none" />
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 bg-surface-2 border border-white/10 flex items-center justify-center group-hover:border-accent/30 transition-all">
          <AppLogos name={app.name} className="w-6 h-6" />
        </div>
        <div className={`px-2 py-0.5 border text-[7px] font-black uppercase tracking-widest ${
          app.connected ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-white/5 border-white/10 text-white/30'
        }`}>
          {app.connected ? 'Connected' : app.status}
        </div>
      </div>
      <h3 className="text-xs font-black text-white uppercase tracking-wider mb-1 group-hover:text-accent transition-colors">{app.name}</h3>
      {app.connected && app.connectedAccount && (
        <p className="text-[8px] font-mono text-emerald-400/70 uppercase tracking-widest mb-2">✓ {app.connectedAccount}</p>
      )}
      <p className="text-[9px] font-mono text-white/25 uppercase tracking-widest leading-relaxed">
        {APP_DETAILS[app.key]?.description || 'Click to configure and view options'}
      </p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[8px] font-mono text-white/15 uppercase tracking-widest">
          {(APP_DETAILS[app.key]?.triggers?.length || 0)} triggers · {(APP_DETAILS[app.key]?.actions?.length || 0)} actions
        </span>
        <ChevronRight className="w-3 h-3 text-white/10 group-hover:text-accent transition-colors" />
      </div>
    </div>
    <div className="absolute bottom-0 left-0 h-[2px] bg-accent w-0 group-hover:w-full transition-all duration-500" />
  </motion.div>
);

// ---------- MAIN PAGE ----------
export const Apps = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState('ALL_APPS');
  const [apps, setApps] = useState([]);
  const [selectedApp, setSelectedApp] = useState(null);
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');

  const loadApps = async (selectedAppKey = null) => {
    try {
      const result = await appsApi.list();
      const nextApps = result.data || [];
      setApps(nextApps);
      if (selectedAppKey) {
        const updatedApp = nextApps.find((item) => item.key === selectedAppKey);
        if (updatedApp) setSelectedApp(updatedApp);
      }
    } catch (error) {
      setMessage('Could not load app directory');
    }
  };

  useEffect(() => {
    loadApps();
  }, []);

  const filteredApps = apps.filter((app) => {
    const matchCat = activeCategory === 'ALL_APPS' || (activeCategory === 'BETA' ? app.status === 'beta' : app.category?.toUpperCase() === activeCategory);
    const matchSearch = !search || app.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const connectedCount = apps.filter(a => a.connected).length;

  return (
    <div className="min-h-screen bg-obsidian p-8">
      <div className="max-w-[1400px] mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Grid className="w-4 h-4 text-accent" />
              <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Integrated_Ecosystem // App_Nexus</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase">
              ORVEXIA <span className="text-accent italic">APP_DIRECTORY</span>
            </h1>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-accent tracking-tighter">{connectedCount}</p>
            <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">Connected</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative group max-w-2xl">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-white/20" />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="SEARCH APPS..."
            className="w-full bg-white/5 border border-white/10 pl-16 pr-6 py-4 text-[11px] font-mono text-white placeholder-white/10 focus:outline-none focus:border-accent/40 uppercase tracking-widest"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-3 border-b border-white/[0.03] pb-5">
          {APP_CATEGORIES.map((cat) => (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${activeCategory === cat ? 'bg-accent text-white' : 'text-white/30 hover:text-white'}`}
            >{cat}</button>
          ))}
        </div>

        {message && (
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-4 py-3 text-[10px] font-black text-white/60 uppercase tracking-widest">
            <CheckCircle2 className="w-4 h-4 text-accent" /> {message}
          </div>
        )}

        {/* App Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredApps.map((app) => (
            <AppCard key={app.key} app={app} onSelect={setSelectedApp} />
          ))}
        </div>
      </div>

      {/* Detail Panel Modal */}
      <AnimatePresence>
        {selectedApp && (
          <AppDetailPanel
            app={selectedApp}
            onClose={() => setSelectedApp(null)}
            navigate={navigate}
            onConnectionSaved={loadApps}
            user={user}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
