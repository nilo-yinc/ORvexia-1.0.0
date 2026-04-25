import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  Check,
  Star,
  Zap,
  Globe,
  Shield,
  BarChart,
  Sparkles,
  Layers,
  Cpu,
  MousePointer2,
  Users,
  Plus,
  Settings,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { features, testimonials, pricingPlans } from '../utils/MockData';

export const Landing = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleGetStarted = async () => {
    navigate('/home');
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] selection:bg-orange-500 selection:text-white">

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 bg-white/70 dark:bg-black/70 backdrop-blur-xl border-b border-gray-200 dark:border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-9 h-9 rounded-xl bg-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black tracking-tighter text-gray-900 dark:text-white">
              ORVEXIA
            </span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 mr-4">
              {['Features', 'Solutions', 'Pricing', 'Docs'].map(item => (
                <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                  {item}
                </a>
              ))}
            </div>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 hover:text-orange-500 transition-colors"
            >
              Login
            </button>
            <button
              onClick={handleGetStarted}
              className="px-6 py-2.5 bg-orange-500 text-white text-sm font-bold rounded-full hover:bg-orange-600 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 transition-all transform hover:-translate-y-0.5 active:scale-95"
            >
              Get Started Free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-[100px] -z-10" />

        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/5 border border-orange-500/20 text-orange-500 text-[10px] font-black tracking-[0.2em] mb-8">
              <Sparkles className="w-3.5 h-3.5" />
              INTELLIGENT AUTONOMY
            </div>
            <h1 className="text-6xl md:text-[92px] font-black text-gray-900 dark:text-white leading-[0.85] mb-8 tracking-tighter">
              Automate the <br />
              <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">impossible.</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Connect your stack with self-healing, agentic workflows.
              The most advanced automation engine ever built for enterprise.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="group px-10 py-5 bg-orange-500 text-white font-black rounded-2xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2 shadow-[0_20px_40px_-10px_rgba(249,115,22,0.4)] hover:-translate-y-1"
              >
                Launch Builder
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                className="px-10 py-5 bg-white dark:bg-[#0c0c0c] border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold rounded-2xl hover:bg-gray-50 dark:hover:bg-[#151515] transition-all"
              >
                View Live Demo
              </button>
            </div>
          </motion.div>

          {/* New High-Fidelity Hero Mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 1 }}
            className="relative mx-auto mt-20 max-w-5xl group"
          >
            {/* Mockup Outer Shadow/Glow */}
            <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 blur-[100px] -z-10 group-hover:bg-orange-500/30 transition-all duration-700" />

            {/* The "Virtual Canvas" Mockup */}
            <div className="bg-[#fcfdfe] dark:bg-[#080808] border-[1px] border-gray-200 dark:border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[16/10] relative flex items-center justify-center p-4">

              {/* Grid Background Overlay */}
              <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.1]"
                style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 0)', backgroundSize: '32px 32px' }} />

              <div className="relative w-full h-full flex flex-col items-center pt-20 scale-75 sm:scale-90 md:scale-100 origin-top">

                {/* 1. Trigger Node */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10 w-52 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border border-gray-200 dark:border-white/10 p-4 rounded-2xl shadow-xl flex items-center gap-4 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/20">
                    <Zap className="w-5 h-5 text-white" strokeWidth={3} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-green-600 uppercase tracking-widest">Trigger</p>
                    <p className="text-sm font-black dark:text-white">API Webhook</p>
                  </div>
                </motion.div>

                {/* Connector Line 1 */}
                <div className="w-[3px] h-16 bg-gray-100 dark:bg-white/5 relative">
                  <motion.div
                    animate={{ top: ['0%', '100%'], opacity: [0, 1, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    className="absolute left-[-2px] w-2 h-6 bg-gradient-to-b from-orange-400 to-orange-600 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.8)]" />
                </div>

                {/* 2. AI Logic Node */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="relative z-10 w-64 bg-white/80 dark:bg-[#111]/80 backdrop-blur-xl border-2 border-orange-500/20 dark:border-orange-500/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4 transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/40">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">AI Agent</p>
                    <p className="text-sm font-black dark:text-white">Process Logic v4.2</p>
                  </div>
                  <div className="ml-auto flex -space-x-2">
                    <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-800 border-2 border-white dark:border-[#111]" />
                    <div className="w-6 h-6 rounded-full bg-orange-500 border-2 border-white dark:border-[#111]" />
                  </div>
                </motion.div>

                {/* Connector Line 2 */}
                <div className="w-[3px] h-16 bg-gray-100 dark:bg-white/5" />

                <div className="relative z-10 w-full flex justify-center gap-[20%] items-start">
                  {/* Results Nodes */}
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="w-44 bg-white/50 dark:bg-[#111]/50 backdrop-blur-md border border-gray-100 dark:border-white/5 p-3 rounded-2xl shadow-lg flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                      <Globe className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-black dark:text-gray-300">Salesforce</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="w-44 bg-white/50 dark:bg-[#111]/50 backdrop-blur-md border border-gray-100 dark:border-white/5 p-3 rounded-2xl shadow-lg flex items-center gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                      <Layers className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-xs font-black dark:text-gray-300">Slack Pro</p>
                  </motion.div>

                  {/* SVG Paths for branches */}
                  <svg className="w-full h-full absolute top-[-64px] inset-0" style={{ pointerEvents: 'none' }}>
                    <path d="M 50% 16 L 50% 48 L 30% 64 L 30% 120" fill="none" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="3" />
                    <path d="M 50% 48 L 70% 64 L 70% 120" fill="none" className="stroke-gray-100 dark:stroke-white/5" strokeWidth="3" />
                  </svg>
                </div>
              </div>

              {/* Status Indicator Mockup */}
              <div className="absolute top-10 right-10 z-50 p-5 bg-white/95 dark:bg-[#111]/95 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] rounded-[2rem] border border-gray-100 dark:border-white/10 group-hover:scale-105 transition-transform">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                    <Check className="w-7 h-7 text-green-500" strokeWidth={4} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">NODE STATUS</p>
                    <p className="text-base font-black dark:text-white leading-none">Live & Syncing</p>
                  </div>
                </div>
              </div>

            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-24 border-y border-gray-100 dark:border-white/5 bg-gray-50/30 dark:bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-[0.4em] mb-16">
            TRUSTED BY MODERN ENTERPRISE TEAMS
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-20 gap-y-12 opacity-30 dark:opacity-20 grayscale group-hover:grayscale-0 transition-all duration-700">
            {['TECHCORP', 'DATAFLOW', 'INNOVATE', 'GLOBALSYNC', 'MODERNA'].map(name => (
              <span key={name} className="text-3xl font-black tracking-tighter dark:text-white transition-all hover:text-orange-500 cursor-default">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-32 px-6 relative">
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_70%_50%,rgba(249,115,22,0.03)_0%,transparent_70%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-5xl md:text-6xl font-black text-gray-900 dark:text-white mb-8 tracking-tighter leading-none">
              Power features for <br /> <span className="text-orange-500">elite</span> operations.
            </h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 font-medium max-w-2xl mx-auto">
              Built to handle millions of tasks with zero latency and complete predictability.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {features.map((feature, i) => {
              const IconComp = {
                Sparkles, MousePointer2, Shield, Cpu, BarChart, Globe
              }[feature.icon] || Sparkles;

              return (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="group bg-white dark:bg-[#0c0c0c] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 hover:border-orange-500/50 transition-all hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] relative overflow-hidden"
                >
                  <div className="w-14 h-14 bg-orange-500/5 dark:bg-orange-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                    <IconComp className="w-7 h-7 text-orange-500 group-hover:text-white" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 font-medium text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-32 px-6 bg-[#fafafa] dark:bg-[#070707]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
              Proof of <span className="text-orange-500">performance.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#1a1a1a] rounded-[2rem] p-8 shadow-sm flex flex-col"
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-orange-500 text-orange-500" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-8 font-medium italic leading-relaxed grow">
                  "{t.content}"
                </p>
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100 dark:border-[#1a1a1a]">
                  <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-gray-100 dark:ring-[#1a1a1a]" />
                  <div>
                    <p className="font-bold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-[10px] text-orange-500 font-black uppercase tracking-widest">{t.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 tracking-tighter leading-tight">
              Simple, transparent <br /><span className="text-orange-500">enterprise</span> pricing.
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto items-end">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col bg-white dark:bg-[#0d0d0d] border ${plan.highlighted
                  ? 'border-orange-500 shadow-2xl shadow-orange-500/10 ring-4 ring-orange-500/5 scale-105 z-10'
                  : 'border-gray-200 dark:border-[#1a1a1a]'
                  } rounded-[2.5rem] p-10 h-full`}
              >
                {plan.highlighted && (
                  <div className="self-start px-3 py-1 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full mb-6">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-2">{plan.name}</h3>
                <p className="text-gray-500 text-sm font-medium mb-8">{plan.description}</p>
                <div className="mb-8">
                  <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tighter">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-400 font-bold ml-1">{plan.period}</span>}
                </div>
                <div className="space-y-4 mb-10 grow">
                  {plan.features.map((f, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-orange-500" strokeWidth={4} />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm font-medium">{f}</span>
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleGetStarted}
                  className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${plan.highlighted
                    ? 'bg-orange-500 text-white hover:bg-orange-600'
                    : 'bg-gray-100 dark:bg-[#1a1a1a] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#222222]'
                    }`}
                >
                  Get Started
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - The "WOW" Redesign */}
      <section className="py-40 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-6xl mx-auto p-12 md:p-28 text-center relative"
        >
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-500 text-[10px] font-black tracking-[0.3em] mb-10">
              LIMITED ENTERPRISE SLOTS AVAILABLE
            </div>
            <h2 className="text-5xl md:text-8xl font-black text-gray-900 dark:text-white mb-12 tracking-tighter leading-[0.85]">
              Ready to <span className="bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent italic">ascend?</span>
            </h2>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="px-14 py-7 bg-orange-500 text-white font-black text-xl rounded-2xl hover:bg-orange-600 transition-all shadow-xl hover:scale-105 active:scale-95"
              >
                Start Building Now
              </button>
              <button className="px-12 py-6 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white font-bold text-lg rounded-2xl hover:bg-gray-200 dark:hover:bg-white/10 transition-all">
                Contact Sales
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-white/5 pb-20 pt-32 px-6 bg-white dark:bg-[#030303]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-6 gap-x-12 gap-y-16 mb-24">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-orange-500 flex items-center justify-center font-black text-white shadow-lg shadow-orange-500/20">V</div>
                <span className="text-2xl font-black tracking-tighter dark:text-white">ORVEXIA</span>
              </div>
              <p className="text-sm text-gray-500 font-medium max-w-xs leading-relaxed">
                The leading agentic AI platform for enterprise workflow automation.
                Designed for the next generation of global infrastructure.
              </p>
            </div>
            {[
              { title: 'System', links: ['Workflows', 'AI Agents', 'Integrations', 'Security'] },
              { title: 'Network', links: ['About', 'Careers', 'Ecosystem', 'News'] },
              { title: 'Academy', links: ['Documentation', 'Guides', 'Templates', 'API'] },
              { title: 'Entity', links: ['Privacy', 'Legal', 'Governance', 'Contact'] }
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-gray-900 dark:text-white mb-8">{col.title}</h4>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-[11px] font-bold text-gray-400 hover:text-orange-500 transition-colors uppercase tracking-widest leading-none">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-12 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] font-black text-gray-400 dark:text-gray-600 tracking-[0.3em] uppercase">© 2026 ORVEXIA GLOBAL / LEVEL 9 AUTONOMY</p>
            <div className="flex gap-10">
              {['TWITTER', 'LINKEDIN', 'GITHUB', 'YOUTUBE'].map(s => (
                <a key={s} href="#" className="text-[10px] font-black text-gray-400 hover:text-orange-500 transition-all tracking-[0.2em]">{s}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
