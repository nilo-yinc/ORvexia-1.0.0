import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { Mail, MessageSquare, Database, Zap, ArrowRight, Star } from 'lucide-react';

const BlueprintCard = ({ blueprint, onUse }) => {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const onMouseMove = (e) => {
      const { left, top, width, height } = card.getBoundingClientRect();
      const x = e.clientX - left;
      const y = e.clientY - top;
      
      const xPct = (x / width - 0.5) * 20; // 20deg max tilt
      const yPct = (y / height - 0.5) * -20;

      gsap.to(card, {
        rotateY: xPct,
        rotateX: yPct,
        duration: 0.5,
        ease: 'power2.out',
        transformPerspective: 1000
      });

      if (glowRef.current) {
        gsap.to(glowRef.current, {
          opacity: 1,
          x: x - 100,
          y: y - 100,
          duration: 0.2
        });
      }
    };

    const onMouseLeave = () => {
      gsap.to(card, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.5,
        ease: 'elastic.out(1, 0.5)'
      });
      if (glowRef.current) {
        gsap.to(glowRef.current, { opacity: 0, duration: 0.5 });
      }
    };

    card.addEventListener('mousemove', onMouseMove);
    card.addEventListener('mouseleave', onMouseLeave);
    return () => {
      card.removeEventListener('mousemove', onMouseMove);
      card.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  const getIcon = (app) => {
    switch (app?.toLowerCase()) {
      case 'gmail': return <Mail className="w-5 h-5 text-red-400" />;
      case 'slack': return <MessageSquare className="w-5 h-5 text-purple-400" />;
      case 'notion': return <Database className="w-5 h-5 text-gray-200" />;
      case 'ai': return <Zap className="w-5 h-5 text-yellow-400" />;
      default: return <Zap className="w-5 h-5 text-blue-400" />;
    }
  };

  const apps = [...new Set(blueprint.definition.nodes.map(n => n.data?.app).filter(Boolean))];

  return (
    <motion.div
      ref={cardRef}
      layout
      className={`relative group p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden flex flex-col h-full cursor-pointer transition-colors hover:bg-[#111] ${blueprint.isFeatured ? 'ring-1 ring-yellow-500/30' : ''}`}
      onClick={() => onUse(blueprint)}
    >
      {/* Border Beam / Glow for Featured */}
      {blueprint.isFeatured && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent animate-border-beam" />
        </div>
      )}

      {/* Radial Hover Glow */}
      <div 
        ref={glowRef}
        className="absolute w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none opacity-0"
      />

      <div className="flex justify-between items-start mb-4">
        <div className="flex -space-x-2">
          {apps.map((app, i) => (
            <div key={i} className="p-2 rounded-lg bg-black border border-white/10 shadow-xl">
              {getIcon(app)}
            </div>
          ))}
        </div>
        {blueprint.isFeatured && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-[10px] font-bold tracking-wider uppercase">
            <Star className="w-3 h-3 fill-current" /> Featured
          </span>
        )}
      </div>

      <h3 className="text-lg font-bold text-white mb-2 group-hover:text-yellow-400 transition-colors">
        {blueprint.name}
      </h3>
      <p className="text-sm text-gray-400 flex-grow mb-6 line-clamp-3">
        {blueprint.description}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <div className="flex gap-2">
          {blueprint.tags?.slice(0, 2).map(tag => (
            <span key={tag} className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-gray-500">
              #{tag}
            </span>
          ))}
        </div>
        <button className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 px-4 py-2 rounded-lg hover:bg-white/10 transition-all active:scale-95 group/btn">
          Use Template <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
};

export default BlueprintCard;
