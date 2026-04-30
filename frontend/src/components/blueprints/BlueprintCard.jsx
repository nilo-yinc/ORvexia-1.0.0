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

const appColors = {
  Gmail: '#EA4335', Slack: '#4A154B', GitHub: '#181717', Notion: '#000000',
  'Google Drive': '#4285F4', Discord: '#5865F2', Stripe: '#635BFF',
  HubSpot: '#FF7A59', Calendly: '#006BFF', Webhook: '#FF5F1F',
  Start: '#FF5F1F', 'HTTP Request': '#FF5F1F', 'AI Agent': '#FF5F1F',
};

  const nodeLabels = blueprint.definition?.nodes?.map(n => n.data?.app || n.data?.label).filter(Boolean) || [];
  const appChain = nodeLabels.length > 0 ? nodeLabels : ['Start'];

  return (
    <motion.div
      ref={cardRef}
      layout
      className={`relative group bg-[#0a0a0a] border border-white/5 overflow-hidden flex flex-col h-full cursor-pointer transition-colors hover:bg-[#111] ${blueprint.isFeatured ? 'ring-1 ring-yellow-500/30' : ''}`}
      onClick={() => onUse(blueprint)}
    >
      {/* Flow Preview Top Banner */}
      <div className="h-32 bg-white/[0.02] relative overflow-hidden flex items-center justify-center p-6 border-b border-white/[0.03]">
        <div className="flex items-center gap-3">
          {appChain.slice(0, 4).map((app, i) => (
            <div key={i} className="flex items-center gap-3">
              <div
                className="w-10 h-10 flex items-center justify-center border border-white/10 bg-black text-[9px] font-black uppercase tracking-wider text-white/50 group-hover:border-accent/30 transition-all shadow-xl"
                style={{ borderLeftColor: appColors[app] || '#FF5F1F', borderLeftWidth: '3px' }}
              >
                {app.slice(0, 2)}
              </div>
              {i < Math.min(appChain.length, 4) - 1 && (
                <div className="flex items-center">
                  <div className="w-6 h-[1px] bg-white/10" />
                  <div className="w-0 h-0 border-t-[3px] border-b-[3px] border-l-[4px] border-transparent border-l-white/10" />
                </div>
              )}
            </div>
          ))}
          {appChain.length > 4 && (
            <span className="text-[9px] text-white/20 font-mono">+{appChain.length - 4}</span>
          )}
        </div>
        
        {blueprint.isFeatured && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1 px-2 py-1 bg-yellow-500/10 text-yellow-500 text-[8px] font-bold tracking-widest uppercase border border-yellow-500/20">
              <Star className="w-2.5 h-2.5 fill-current" /> Featured
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow relative">
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

      <div className="flex flex-col mb-4 mt-2">
        <h3 className="text-xl font-black text-white group-hover:text-accent transition-colors tracking-tighter uppercase">
          {blueprint.name}
        </h3>
        <div className="flex items-center gap-2 mt-3 mb-2">
          <span className="text-[8px] font-mono text-accent uppercase tracking-widest px-2 py-0.5 bg-accent/10 border border-accent/20">
            Architect
          </span>
          <span className="text-[10px] font-bold text-white/80 uppercase tracking-widest">
            {blueprint.authorName || 'System Architect'}
          </span>
        </div>
      </div>

      <p className="text-[11px] font-mono text-white/40 mb-4 line-clamp-3 leading-relaxed">
        {blueprint.description}
      </p>

      {/* Nodes chip row */}
      <div className="flex flex-wrap gap-1 flex-grow mb-6">
        {[...new Set(nodeLabels)].slice(0, 3).map((label, i) => (
          <span key={i} className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-white/5 border border-white/5 text-white/30">
            {label}
          </span>
        ))}
        {new Set(nodeLabels).size > 3 && (
          <span className="px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider bg-accent/10 border border-accent/20 text-accent/60">
            +{new Set(nodeLabels).size - 3} more
          </span>
        )}
      </div>

      {/* Module count */}
      <div className="flex items-center gap-4 mb-4 pt-4 border-t border-white/5">
        <div className="flex flex-col">
           <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Nodes</span>
           <span className="text-xs font-black text-white/60">{blueprint.definition?.nodes?.length || 0}</span>
        </div>
        <div className="flex flex-col">
           <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Category</span>
           <span className="text-xs font-black text-white/60 uppercase">{blueprint.category || 'System'}</span>
        </div>
      </div>

      <div className="mt-auto flex items-center justify-between">
        <button 
          onClick={(e) => { e.stopPropagation(); onUse(blueprint); }}
          className="w-full flex items-center justify-center gap-2 text-[10px] font-black tracking-widest uppercase text-white bg-white/5 border border-white/10 px-4 py-3 hover:bg-accent hover:border-accent transition-all active:scale-[0.98] group/btn"
        >
          Use Template <ArrowRight className="w-3 h-3 group-hover/btn:translate-x-1 transition-transform" />
        </button>
      </div>
      </div>
    </motion.div>
  );
};

export default BlueprintCard;
