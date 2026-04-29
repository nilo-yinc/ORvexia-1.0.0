import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Grid, LayoutList } from 'lucide-react';
import axios from 'axios';
import BlueprintCard from './BlueprintCard';

const CATEGORIES = ['All', 'Productivity', 'Social', 'Sales', 'Utilities', 'AI'];

const BlueprintGallery = ({ onSelectBlueprint }) => {
  const [blueprints, setBlueprints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [layout, setLayout] = useState('grid');

  useEffect(() => {
    fetchBlueprints();
  }, [category, search]);

  const fetchBlueprints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/blueprints`, {
        params: { category, search }
      });
      setBlueprints(res.data);
    } catch (err) {
      console.error('Failed to fetch blueprints:', err);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6">
      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#050505]/50 p-4 rounded-2xl border border-white/5 backdrop-blur-xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search blueprints..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-yellow-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex gap-1 bg-black p-1 rounded-xl border border-white/10 overflow-x-auto no-scrollbar">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${category === cat ? 'bg-white/10 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          <div className="hidden sm:flex gap-1 bg-black p-1 rounded-xl border border-white/10">
            <button onClick={() => setLayout('grid')} className={`p-1.5 rounded-lg transition-all ${layout === 'grid' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><Grid className="w-4 h-4" /></button>
            <button onClick={() => setLayout('list')} className={`p-1.5 rounded-lg transition-all ${layout === 'list' ? 'bg-white/10 text-white' : 'text-gray-500'}`}><LayoutList className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {/* Bento Grid Gallery */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-64 rounded-2xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={layout === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "flex flex-col gap-4"}
        >
          <AnimatePresence mode="popLayout">
            {blueprints.map((blueprint) => (
              <motion.div 
                key={blueprint._id} 
                variants={item}
                layout
                exit={{ opacity: 0, scale: 0.9 }}
                className={blueprint.isFeatured ? 'md:col-span-2 lg:col-span-1' : ''}
              >
                <BlueprintCard 
                  blueprint={blueprint} 
                  onUse={onSelectBlueprint} 
                />
              </motion.div>
            ))}
          </AnimatePresence>

          {blueprints.length === 0 && (
            <div className="col-span-full py-20 text-center space-y-4">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto">
                <Filter className="w-8 h-8 text-gray-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-500">No blueprints found</h3>
              <p className="text-sm text-gray-600">Try adjusting your filters or search term.</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default BlueprintGallery;
