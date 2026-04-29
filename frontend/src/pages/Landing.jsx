import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import BlueprintGallery from '../components/blueprints/BlueprintGallery';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  ArrowRight,
  Check,
  Star,
  Zap,
  Globe,
  Layers,
  Sparkles,
  MousePointer2,
  Shield,
  Cpu,
  BarChart,
  X,
  User,
  Sun,
  Moon,
  Lock,
  ArrowLeft,
  ChevronRight,
  Terminal,
  Activity,
  Box,
  Share2,
  Database,
  Code,
  GitBranch,
  Search,
  MessageSquare,
  Mail,
  FileText
} from 'lucide-react';
import { features, testimonials, pricingPlans } from '../utils/MockData';

gsap.registerPlugin(ScrollTrigger);

// --- PREMIUM COMPONENTS ---

const Logo = () => (
  <div className="flex items-center gap-3 group cursor-pointer">
    <div className="relative w-10 h-10">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-accent transition-transform duration-500 group-hover:rotate-90">
        <path 
          d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-accent rotate-45 group-hover:scale-125 transition-transform duration-300" />
      </div>
      <div className="absolute inset-0 rounded-full border border-accent/20 animate-pulse-slow scale-150" />
    </div>
    <span className="text-2xl font-black tracking-tighter text-white font-sans uppercase">
      ORV<span className="text-accent">EXIA</span>
    </span>
  </div>
);

const KineticButton = ({ children, primary = false, onClick }) => (
  <button
    onClick={onClick}
    className={`
      relative px-8 py-4 font-bold uppercase tracking-widest text-xs transition-all duration-300 overflow-hidden group
      ${primary ? 'bg-accent text-white' : 'bg-white/5 text-white border border-white/10 hover:border-accent/40'}
    `}
  >
    <div className="relative z-10 flex items-center gap-3">
      {children}
    </div>
    <div className={`
      absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out
      ${primary ? 'hidden' : ''}
    `} />
    <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-white/30 group-hover:border-accent" />
    <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-white/30 group-hover:border-accent" />
  </button>
);

const IndustrialCard = ({ icon: Icon, title, description, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    className="relative group p-8 bg-surface-1 border border-white/5 hover:border-accent/30 transition-all duration-500"
  >
    <div className="absolute top-4 right-4 font-mono text-[10px] text-white/20 group-hover:text-accent transition-colors">
      ID_{String(index + 1).padStart(2, '0')}
    </div>
    
    <div className="mb-6 inline-flex p-3 bg-accent/5 border border-accent/10 group-hover:bg-accent group-hover:text-white transition-all duration-500">
      <Icon className="w-6 h-6 text-accent group-hover:text-white" />
    </div>
    
    <h3 className="text-lg font-bold text-white mb-3 tracking-tight group-hover:translate-x-1 transition-transform uppercase">
      {title}
    </h3>
    <p className="text-white/40 text-sm leading-relaxed font-medium uppercase tracking-wider">
      {description}
    </p>

    <div className="absolute bottom-0 left-0 h-[2px] bg-accent transition-all duration-500 w-0 group-hover:w-full" />
  </motion.div>
);

// --- SYSTEM SIMULATION COMPONENT ---
const SystemSimulation = () => {
  const [logs, setLogs] = useState([
    'INIT_PROTOCOL_4.2',
    'SYNCHRONIZING_NODES...',
    'DATA_FLOW_STABLE'
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const logPool = [
        'ACCESSING_UPSTREAM_API...',
        'ENCRYPTING_PAYLOAD_L9',
        'EXECUTING_LOGIC_GATE_X7',
        'AUTHORIZING_NODE_ALPHA',
        'OPTIMIZING_LATENCY...',
        'RECURSIVE_CHECK_PASS',
        'THROTTLING_INCOMING_OPS',
        'SYSTEM_HEALTH: 100%'
      ];
      setLogs(prev => [...prev.slice(-3), logPool[Math.floor(Math.random() * logPool.length)]]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-full bg-surface-0 overflow-hidden flex flex-col">
       {/* CRT Scanline Effect */}
       <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20" />
       
       {/* Background Grid */}
       <div className="absolute inset-0 surface-dot-grid opacity-[0.05]" />

       {/* Simulation Canvas */}
       <div className="flex-1 relative p-8">
          <svg className="w-full h-full" viewBox="0 0 400 400">
             {/* Paths */}
             <motion.path 
               d="M 50 200 Q 200 50 350 200" 
               stroke="rgba(255,95,31,0.2)" 
               strokeWidth="1" 
               fill="none" 
               strokeDasharray="4 4"
             />
             <motion.path 
               d="M 50 200 Q 200 350 350 200" 
               stroke="rgba(255,95,31,0.2)" 
               strokeWidth="1" 
               fill="none" 
               strokeDasharray="4 4"
             />

             {/* Animated Data Pulses */}
             <motion.circle r="3" fill="#FF5F1F">
                <animateMotion 
                  dur="3s" 
                  repeatCount="indefinite" 
                  path="M 50 200 Q 200 50 350 200"
                />
             </motion.circle>
             <motion.circle r="3" fill="#FF5F1F">
                <animateMotion 
                  dur="4s" 
                  repeatCount="indefinite" 
                  path="M 350 200 Q 200 350 50 200"
                />
             </motion.circle>

             {/* Nodes */}
             <g transform="translate(50, 200)">
                <circle r="20" className="fill-surface-1 stroke-white/10" strokeWidth="1" />
                <Mail className="w-5 h-5 text-accent -translate-x-2.5 -translate-y-2.5" />
             </g>
             <g transform="translate(350, 200)">
                <circle r="20" className="fill-surface-1 stroke-white/10" strokeWidth="1" />
                <MessageSquare className="w-5 h-5 text-white/40 -translate-x-2.5 -translate-y-2.5" />
             </g>
             <g transform="translate(200, 200)">
                <circle r="25" className="fill-accent stroke-white/10 animate-pulse" strokeWidth="1" />
                <Cpu className="w-6 h-6 text-white -translate-x-3 -translate-y-3" />
             </g>
          </svg>

          {/* Floating UI elements */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
            className="absolute top-10 right-10 p-3 bg-surface-1 border border-white/5 shadow-2xl"
          >
             <div className="flex flex-col gap-1">
                <div className="w-8 h-1 bg-accent" />
                <div className="w-4 h-1 bg-white/10" />
             </div>
          </motion.div>
       </div>

       {/* Log Stream Terminal */}
       <div className="bg-obsidian border-t border-white/[0.05] p-4 font-mono text-[9px] h-24 flex flex-col justify-end">
          {logs.map((log, i) => (
            <div key={i} className="flex gap-4">
               <span className="text-white/10">[{new Date().toLocaleTimeString()}]</span>
               <span className={i === logs.length - 1 ? 'text-accent' : 'text-white/20'}>{log}</span>
            </div>
          ))}
       </div>
    </div>
  );
};

// --- MAIN PAGE ---

export const Landing = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);

  useEffect(() => {
    // GSAP Entrance Animations
    const ctx = gsap.context(() => {
      gsap.from('.hero-title', {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.2
      });
      
      gsap.from('.hero-mockup', {
        scale: 0.8,
        opacity: 0,
        duration: 1.5,
        ease: 'expo.out',
        delay: 0.5
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans selection:bg-accent selection:text-white overflow-x-hidden uppercase">
      
      {/* --- GRID BACKGROUND --- */}
      <div className="fixed inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 surface-dot-grid" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-obsidian/50 to-obsidian" />
      </div>

      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-6 flex items-center justify-between backdrop-blur-md bg-obsidian/20 border-b border-white/[0.03]">
        <Logo />
        <div className="hidden lg:flex items-center gap-12">
          {['Infrastructure', 'Architecture', 'Integrations', 'Entity'].map((item) => (
            <a 
              key={item} 
              href={`#${item.toLowerCase()}`} 
              className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40 hover:text-accent transition-colors"
            >
              {item}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-6">
          <button 
            onClick={() => navigate('/login')}
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/60 hover:text-white transition-colors"
          >
            Terminal Login
          </button>
          <KineticButton primary onClick={() => navigate('/home')}>
            Initiate System
          </KineticButton>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section ref={heroRef} className="relative pt-48 pb-32 px-8 z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          
          <div className="flex-1 text-left">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-3 px-3 py-1 bg-accent/10 border border-accent/20 mb-8"
            >
              <div className="w-1.5 h-1.5 bg-accent animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-accent">System Status: Optimal // Core v4.2</span>
            </motion.div>
            
            <h1 className="hero-title text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
              AUTOMATE BEYOND <br />
              <span className="text-accent italic">LIMITS.</span>
            </h1>
            
            <p className="hero-title text-xl text-white/50 max-w-xl mb-12 font-medium leading-relaxed uppercase tracking-wider">
              The only industrial-grade automation engine with built-in Data Tables, 
              Form Builders, and AI Agents. Scale your operations from zero to millions of tasks.
            </p>

            <div className="hero-title flex items-center gap-8">
              <KineticButton primary onClick={() => navigate('/home')}>
                Launch Architect <Zap className="w-4 h-4" />
              </KineticButton>
              <button className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-all group">
                <div className="w-10 h-[1px] bg-white/20 group-hover:bg-accent transition-all group-hover:w-16" />
                View Blueprint
              </button>
            </div>
          </div>

          <div className="flex-1 relative hero-mockup w-full">
            {/* 3D Simulation Container */}
            <div className="relative aspect-square w-full max-w-xl group">
              {/* Animated Floating Nodes (SVG) */}
              <div className="absolute inset-0 z-30 pointer-events-none overflow-visible">
                {/* Node 1 */}
                <motion.div 
                  animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-1/4 -left-10 p-4 bg-surface-1/80 backdrop-blur-xl border border-accent/30 shadow-2xl"
                >
                  <Cpu className="w-5 h-5 text-accent" />
                </motion.div>
                {/* Node 2 */}
                <motion.div 
                  animate={{ y: [0, 20, 0], x: [0, -10, 0] }}
                  transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                  className="absolute bottom-1/4 -right-10 p-4 bg-surface-1/80 backdrop-blur-xl border border-white/10 shadow-2xl"
                >
                  <Share2 className="w-5 h-5 text-white/40" />
                </motion.div>
              </div>

              {/* Central Kinetic Simulation Asset */}
              <div className="absolute inset-0 bg-accent/5 border border-white/10 p-4 rounded-[40px] transform rotate-3 group-hover:rotate-0 transition-all duration-700 overflow-hidden shadow-2xl">
                 <SystemSimulation />
                 {/* Glass overlay */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-white/[0.02] to-transparent pointer-events-none" />
              </div>

              {/* Orbiting Ring */}
              <div className="absolute inset-0 border border-white/5 rounded-full scale-125 -z-10 animate-spin-slow opacity-20" />
            </div>
          </div>

        </div>
      </section>

      {/* --- STATS STRIP --- */}
      <section className="border-y border-white/[0.03] py-20 px-8 bg-surface-1/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-12">
          {[
            { label: 'Network Uptime', value: '99.999%', unit: 'SLA' },
            { label: 'Active Agents', value: '14.2', unit: 'MILLION' },
            { label: 'Latency Rate', value: '< 12', unit: 'MS' },
            { label: 'Security Tier', value: 'L-9', unit: 'QUANTUM' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-2 text-center lg:text-left">
              <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-white/30">{stat.label}</span>
              <div className="flex items-baseline justify-center lg:justify-start gap-2">
                <span className="text-4xl font-black tracking-tighter text-white">{stat.value}</span>
                <span className="text-[10px] font-black text-accent">{stat.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Blueprint Showcase Section */}
      <section className="py-40 bg-[#030303] relative overflow-hidden border-y border-white/[0.03]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-accent/5 blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 mb-20 text-center space-y-4">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-[10px] font-bold tracking-[0.5em] text-accent uppercase bg-accent/10 px-6 py-2 rounded-full inline-block"
          >
            System Templates
          </motion.span>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase">
            SYSTEM <span className="text-accent italic">BLUEPRINTS.</span>
          </h2>
          <p className="text-white/40 max-w-2xl mx-auto text-sm uppercase tracking-widest font-medium">
            Deploy power-trio workflows instantly. 
            Connect Gmail, Slack, and Notion in one continuous neural flow.
          </p>
        </div>

        <BlueprintGallery onSelectBlueprint={(bp) => {
          if (isAuthenticated) {
            navigate('/workflows/builder', { state: { blueprint: bp } });
          } else {
            navigate('/login', { state: { blueprint: bp } });
          }
        }} />
      </section>

      {/* --- FEATURES GRID --- */}
      <section id="infrastructure" className="py-40 px-8 relative overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-accent/10 -z-10" />
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-end justify-between mb-24 gap-12">
            <div className="max-w-2xl">
              <span className="text-[10px] font-mono uppercase tracking-[0.5em] text-accent mb-6 block">Capabilities // 01</span>
              <h2 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-8">
                ENGINEERED FOR <br /> <span className="text-accent italic text-7xl md:text-9xl">ABSOLUTE</span> SCALE.
              </h2>
            </div>
            <p className="text-white/40 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-widest">
              Our infrastructure is built on the principle of self-healing autonomy.
              Every node is a sovereign instrument of execution.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 border-t border-l border-white/[0.05]">
            {features.map((feature, i) => {
              const icons = [Cpu, Shield, Zap, Layers, BarChart, Globe];
              return (
                <IndustrialCard 
                  key={i}
                  index={i}
                  icon={icons[i % icons.length]}
                  title={feature.title}
                  description={feature.description}
                />
              );
            })}
          </div>
        </div>
      </section>

      {/* --- KINETIC CTA --- */}
      <section className="py-60 px-8 relative">
        <div className="absolute inset-0 bg-accent/5 -z-10 skew-y-3" />
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-12"
          >
            <div className="w-20 h-20 bg-accent flex items-center justify-center mb-4">
              <Terminal className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.8]">
              READY TO <br /> <span className="text-accent underline decoration-4 underline-offset-8">ASCEND?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <KineticButton primary onClick={() => navigate('/signup')}>
                Initialize Deployment
              </KineticButton>
              <button className="px-8 py-4 border border-white/10 font-bold uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all">
                Request System Access
              </button>
            </div>
            <div className="font-mono text-[10px] text-white/20 mt-8 tracking-[0.5em] uppercase">
              ORVEXIA GLOBAL // SECURITY CLEARANCE REQUIRED
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/[0.03] pt-40 pb-20 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-20 mb-40">
            <div className="col-span-2">
              <Logo />
              <p className="mt-8 text-white/30 text-xs font-medium max-w-xs leading-relaxed uppercase tracking-wider">
                The leading agentic AI platform for enterprise workflow automation. 
                Designed for the next generation of global infrastructure.
              </p>
            </div>
            {[
              { title: 'Core', links: ['System', 'Nodes', 'Logic', 'Flow'] },
              { title: 'Identity', links: ['About', 'Access', 'Security', 'Legal'] },
              { title: 'Network', links: ['Twitter', 'GitHub', 'Discord', 'Status'] }
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white mb-8">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-[10px] font-bold text-white/30 hover:text-accent transition-colors uppercase tracking-widest">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 pt-12 border-t border-white/[0.03]">
            <span className="text-[8px] font-mono tracking-[0.5em] text-white/20 uppercase">
              © 2026 ORVEXIA GLOBAL // L-9 AUTHORIZED // NOISE_PROTOCOL_ENABLED
            </span>
            <div className="flex gap-12">
              {['System Logs', 'API Docs', 'Governance'].map(link => (
                <a key={link} href="#" className="text-[8px] font-bold uppercase tracking-[0.3em] text-white/20 hover:text-white transition-colors">{link}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
};
