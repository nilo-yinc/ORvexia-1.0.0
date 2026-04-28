import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home as HomeIcon,
  Workflow,
  Sparkles,
  BarChart3,
  FolderKanban,
  Settings,
  Menu,
  X,
  Search,
  Bell,
  LogOut,
  User,
  Database,
  FileText,
  Bot,
  Terminal,
  Activity,
  Cpu,
  Layers,
  Layout,
  RefreshCw,
  Grid
} from 'lucide-react';

const menuItems = [
  { icon: HomeIcon, label: 'DASHBOARD', path: '/home' },
  { icon: Workflow, label: 'WORKFLOWS', path: '/workflows' },
  { icon: Database, label: 'DATA_TABLES', path: '/tables' },
  { icon: Layout, label: 'INTERFACES', path: '/interfaces' },
  { icon: RefreshCw, label: 'TRANSFER', path: '/transfer' },
  { icon: Grid, label: 'APPS', path: '/apps' },
  { icon: Bot, label: 'AI_AGENTS', path: '/agents' },
  { icon: BarChart3, label: 'ACTIVITY', path: '/analytics' },
];

const Logo = () => (
  <div className="flex items-center gap-3 group">
    <div className="relative w-8 h-8">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-accent transition-transform duration-500 group-hover:rotate-90">
        <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-3 h-3 bg-accent rotate-45 group-hover:scale-125 transition-transform duration-300" />
      </div>
    </div>
    <span className="text-xl font-black tracking-tighter text-white font-sans">
      ORV<span className="text-accent">EXIA</span>
    </span>
  </div>
);

export const AppLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <div className="min-h-screen bg-obsidian text-white font-sans selection:bg-accent selection:text-white">
      
      {/* --- GRID BACKGROUND --- */}
      <div className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none surface-dot-grid" />

      {/* --- HEADER --- */}
      <header className="sticky top-0 z-[100] bg-surface-1 border-b border-white/[0.05] backdrop-blur-xl">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo & Identity */}
            <div className="flex items-center gap-12">
              <Link to="/" className="flex items-center gap-2">
                <Logo />
              </Link>

              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center gap-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`
                      relative flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all
                      ${isActive(item.path)
                        ? 'text-accent'
                        : 'text-white/40 hover:text-white hover:bg-white/[0.02]'
                      }
                    `}
                  >
                    <item.icon className="w-3.5 h-3.5" />
                    {item.label}
                    {isActive(item.path) && (
                      <motion.div layoutId="nav-active" className="absolute bottom-0 left-4 right-4 h-[1px] bg-accent" />
                    )}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Global Actions */}
            <div className="flex items-center gap-6">
              
              {/* Search Protocol */}
              <div className="hidden lg:flex items-center relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="SEARCH_SYSTEM..."
                  className="bg-surface-2 border border-white/5 pl-9 pr-4 py-2 w-48 text-[10px] font-mono text-white placeholder-white/10 focus:outline-none focus:border-accent/40 focus:w-64 transition-all uppercase tracking-widest"
                />
              </div>

              {/* System Indicators */}
              <div className="hidden md:flex items-center gap-4 px-4 border-l border-white/5">
                <div className="flex flex-col items-end">
                  <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">Network_Stability</span>
                  <div className="flex gap-0.5 mt-1">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="w-1 h-2 bg-accent-success" />
                    ))}
                  </div>
                </div>
                <button className="relative p-2 text-white/20 hover:text-white transition-all">
                  <Bell className="w-4 h-4" />
                  <span className="absolute top-2 right-2 w-1 h-1 bg-accent rounded-full animate-pulse" />
                </button>
              </div>

              {/* User Identity */}
              <div className="relative border-l border-white/5 pl-6">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-3 group"
                >
                  <div className="flex flex-col items-end hidden sm:block">
                    <span className="text-[10px] font-black text-white group-hover:text-accent transition-colors uppercase tracking-widest">
                      {user?.name || 'ADMIN_OPERATOR'}
                    </span>
                    <span className="text-[8px] font-mono text-white/20 uppercase tracking-widest">
                      {user?.role === 'admin' ? 'L-9_Clearance' : 'General_Access'}
                    </span>
                  </div>
                  <div className="w-8 h-8 bg-surface-2 border border-white/5 group-hover:border-accent/40 transition-all flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-4 h-4 text-white/40 group-hover:text-white" />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-40"
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-4 w-60 bg-surface-1 border border-white/5 shadow-2xl p-2 z-50"
                      >
                        <div className="px-4 py-3 border-b border-white/[0.03] mb-2">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest">
                            {user?.name || 'Operator'}
                          </p>
                          <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1 truncate">
                            {user?.email || 'N/A'}
                          </p>
                        </div>
                        <Link
                          to="/settings"
                          className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.02] text-[10px] font-bold text-white/40 hover:text-accent transition-all uppercase tracking-widest"
                          onClick={() => setUserMenuOpen(false)}
                        >
                          <Settings className="w-3.5 h-3.5" />
                          Configuration
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-accent-danger/5 text-[10px] font-bold text-accent-danger/60 hover:text-accent-danger transition-all uppercase tracking-widest"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Terminate_Session
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 text-white/40 hover:text-white"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden border-t border-white/5 bg-surface-1 overflow-hidden"
            >
              <nav className="px-6 py-8 space-y-4">
                {menuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center gap-4 px-4 py-4 border transition-all text-[12px] font-black uppercase tracking-[0.2em]
                      ${isActive(item.path)
                        ? 'bg-accent/10 border-accent/40 text-accent'
                        : 'bg-surface-2 border-white/5 text-white/40'
                      }
                    `}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </Link>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="relative z-10 min-h-[calc(100vh-4rem)]">
        <Outlet />
      </main>

      {/* --- GLOBAL STATUS BAR --- */}
      <footer className="fixed bottom-0 left-0 w-full h-8 bg-surface-1 border-t border-white/[0.05] z-[100] px-6 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-accent-success animate-pulse" />
            <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">System_Status: Operational</span>
          </div>
          <div className="w-[1px] h-3 bg-white/5" />
          <span className="text-[8px] font-mono text-white/20 uppercase tracking-[0.2em]">Sync_Protocol: Secure</span>
        </div>
        <div className="flex items-center gap-6">
           <span className="text-[8px] font-mono text-white/10 uppercase tracking-[0.3em]">ORVEXIA_CORE_v4.2.0</span>
           <span className="text-[8px] font-mono text-white/10 uppercase tracking-[0.3em] tabular-nums">{new Date().toLocaleTimeString()}</span>
        </div>
      </footer>
    </div>
  );
};
