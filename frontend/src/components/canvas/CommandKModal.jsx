import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Command, ArrowRight, FileText, Zap, Bot, Layout, X } from 'lucide-react';

const quickActions = [
  { id: 'new-workflow', label: 'New Workflow', icon: Zap, shortcut: 'N', category: 'Actions' },
  { id: 'add-http', label: 'Add HTTP Request', icon: FileText, shortcut: null, category: 'Blocks' },
  { id: 'add-ai', label: 'Add AI Agent', icon: Bot, shortcut: null, category: 'Blocks' },
  { id: 'templates', label: 'Browse Templates', icon: Layout, shortcut: 'T', category: 'Actions' },
];

const templates = [
  { id: 't1', name: 'Email to Slack Notification', description: 'Forward important emails to a Slack channel', tags: ['Gmail', 'Slack'] },
  { id: 't2', name: 'GitHub Issue Tracker', description: 'Auto-create Notion tickets from GitHub issues', tags: ['GitHub', 'Notion'] },
  { id: 't3', name: 'AI Content Pipeline', description: 'Generate and publish content with AI review', tags: ['AI', 'Sheets'] },
  { id: 't4', name: 'Webhook Data Router', description: 'Route incoming webhooks to multiple services', tags: ['Webhook', 'Logic'] },
];

export const CommandKModal = ({ isOpen, onClose, onAction }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        onAction?.('toggle-cmdk');
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onAction]);

  const filteredActions = useMemo(() => {
    if (!query) return quickActions;
    return quickActions.filter((a) =>
      a.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const filteredTemplates = useMemo(() => {
    if (!query) return templates;
    return templates.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[200] cmdk-overlay"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            className="fixed top-[18%] left-1/2 -translate-x-1/2 z-[201] w-[520px] max-h-[460px] flex flex-col rounded-xl overflow-hidden border border-white/[0.08]"
            style={{
              background: 'rgba(10,10,14,0.92)',
              backdropFilter: 'blur(24px)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            {/* Search bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.04]">
              <Search className="w-4 h-4 text-white/25 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search actions, templates, blocks..."
                className="flex-1 bg-transparent text-sm text-white placeholder-white/25 focus:outline-none"
              />
              <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[10px] text-white/25 font-mono">
                ESC
              </kbd>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto py-2">
              {/* Quick Actions */}
              {filteredActions.length > 0 && (
                <div className="mb-1">
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em]">
                    Quick Actions
                  </div>
                  {filteredActions.map((action) => (
                    <button
                      key={action.id}
                      onClick={() => {
                        onAction?.(action.id);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center group-hover:border-white/[0.12] transition-colors">
                        <action.icon className="w-4 h-4 text-white/40 group-hover:text-white/70 transition-colors" />
                      </div>
                      <span className="flex-1 text-sm text-white/60 group-hover:text-white/90 text-left transition-colors">
                        {action.label}
                      </span>
                      {action.shortcut && (
                        <kbd className="px-1.5 py-0.5 bg-white/[0.03] border border-white/[0.06] rounded text-[10px] text-white/20 font-mono">
                          {action.shortcut}
                        </kbd>
                      )}
                      <ArrowRight className="w-3.5 h-3.5 text-white/10 group-hover:text-white/30 transition-colors" />
                    </button>
                  ))}
                </div>
              )}

              {/* Templates */}
              {filteredTemplates.length > 0 && (
                <div>
                  <div className="px-4 py-1.5 text-[10px] font-semibold text-white/20 uppercase tracking-[0.15em]">
                    Templates
                  </div>
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => {
                        onAction?.(`template-${template.id}`);
                        onClose();
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.04] transition-colors group text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-accent/5 border border-accent/10 flex items-center justify-center shrink-0">
                        <Zap className="w-3.5 h-3.5 text-accent/50" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] text-white/60 group-hover:text-white/90 truncate transition-colors">
                          {template.name}
                        </div>
                        <div className="text-[11px] text-white/20 truncate mt-0.5">
                          {template.description}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {template.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-1.5 py-0.5 bg-white/[0.03] border border-white/[0.04] rounded text-[9px] text-white/25 font-mono"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {filteredActions.length === 0 && filteredTemplates.length === 0 && (
                <div className="px-4 py-10 text-center">
                  <Search className="w-6 h-6 text-white/8 mx-auto mb-2" />
                  <p className="text-xs text-white/20">No results for "{query}"</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-4 py-2.5 border-t border-white/[0.04] text-[10px] text-white/15">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/[0.04] rounded font-mono">↑↓</kbd> Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/[0.04] rounded font-mono">↵</kbd> Select
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white/[0.04] rounded font-mono">esc</kbd> Close
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
