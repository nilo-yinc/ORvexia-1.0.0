import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, ChevronRight, ChevronDown,
  Globe, Zap, Bot, Sparkles, GitBranch, Clock, Code,
  Filter, Repeat, Box, Database, FileCode,
  PanelLeftClose, GripVertical,
} from 'lucide-react';
import { AppLogos } from '../../pages/AppLogos';

const categoryIcons = {
  Actions: Globe,
  Trigger: Zap,
  AI: Bot,
  Logic: GitBranch,
  Looping: Repeat,
  Apps: Box,
};

export const ActivityPalette = ({
  isOpen,
  onClose,
  blockCategories,
  onAddBlock,
  searchQuery,
  setSearchQuery,
}) => {
  const [expandedCategories, setExpandedCategories] = useState(
    Object.keys(blockCategories).reduce((acc, key) => ({ ...acc, [key]: true }), {})
  );

  const toggleCategory = (cat) => {
    setExpandedCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredBlocks = useMemo(() => {
    return Object.entries(blockCategories).reduce((acc, [category, blocks]) => {
      const filtered = blocks.filter((b) =>
        searchQuery === '' || b.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filtered.length > 0) acc[category] = filtered;
      return acc;
    }, {});
  }, [blockCategories, searchQuery]);

  const totalCount = Object.values(filteredBlocks).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 300, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          className="h-full flex flex-col bg-surface-1 border-r border-white/[0.05] z-30 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
            <div className="flex items-center gap-3">
              <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                Protocols
              </h3>
              <div className="px-1.5 py-0.5 bg-white/5 border border-white/10 text-[9px] font-mono text-white/30">
                {String(totalCount).padStart(2, '0')}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/20 hover:text-white transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Search - Industrial Input */}
          <div className="px-4 py-4 border-b border-white/[0.05]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH_LOGIC..."
                className="w-full bg-surface-2 border border-white/5 pl-9 pr-8 py-3 text-[10px] font-mono text-white uppercase tracking-widest focus:outline-none focus:border-accent/40 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {/* Category List */}
          <div className="flex-1 overflow-y-auto py-2 scrollbar-hide">
            {Object.entries(filteredBlocks).map(([category, blocks]) => {
              const CatIcon = categoryIcons[category] || Box;
              const isExpanded = expandedCategories[category];

              return (
                <div key={category} className="mb-1">
                  {/* Category header */}
                  <button
                    onClick={() => toggleCategory(category)}
                    className="w-full flex items-center gap-3 px-6 py-3 hover:bg-white/[0.02] transition-colors group"
                  >
                    {isExpanded ? (
                      <ChevronDown className="w-3 h-3 text-white/20" />
                    ) : (
                      <ChevronRight className="w-3 h-3 text-white/20" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isExpanded ? 'text-accent' : 'text-white/40'}`}>
                      {category}
                    </span>
                    <div className="flex-1 h-[1px] bg-white/[0.02] ml-2" />
                    <span className="text-[9px] text-white/10 font-mono">
                      {blocks.length}
                    </span>
                  </button>

                  {/* Block items */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        {blocks.map((block, idx) => (
                          <button
                            key={idx}
                            onClick={() => onAddBlock(block, category)}
                            className="w-full flex items-center gap-4 px-6 pl-10 py-3 hover:bg-white/[0.03] transition-all text-left group"
                          >
                            <div
                              className="w-8 h-8 flex items-center justify-center bg-surface-2 border border-white/[0.05] group-hover:border-accent/40 group-hover:text-accent transition-all"
                            >
                              {block.logo ? (
                                <AppLogos name={block.logo} className="w-4 h-4" />
                              ) : (
                                <block.icon className="w-3.5 h-3.5" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors truncate">
                                  {block.name.toUpperCase()}
                                </span>
                                {block.badge && (
                                  <span className="px-1 py-0.5 bg-accent/10 text-accent text-[7px] font-bold tracking-widest uppercase">
                                    {block.badge}
                                  </span>
                                )}
                              </div>
                              <p className="text-[8px] font-mono text-white/15 uppercase tracking-wider mt-0.5 line-clamp-1">
                                {block.description}
                              </p>
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}

            {Object.keys(filteredBlocks).length === 0 && (
              <div className="px-6 py-12 text-center">
                <Search className="w-6 h-6 text-white/5 mx-auto mb-3" />
                <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.2em]">0_MATCHES_FOUND</p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
