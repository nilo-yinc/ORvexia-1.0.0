import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Lock, ArrowRight, Zap, Building, Terminal, Cpu, Shield, Loader2, Github } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Logo = () => (
  <div className="flex items-center gap-4 group">
    <div className="relative w-12 h-12">
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full text-accent transition-transform duration-700 group-hover:rotate-180">
        <path d="M50 5 L90 25 L90 75 L50 95 L10 75 L10 25 Z" fill="none" stroke="currentColor" strokeWidth="8" strokeLinejoin="round" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-4 h-4 bg-accent rotate-45 group-hover:scale-125 transition-transform duration-300" />
      </div>
    </div>
    <span className="text-3xl font-black tracking-tighter text-white font-sans">
      ORV<span className="text-accent">EXIA</span>
    </span>
  </div>
);

const InputField = ({ label, icon: Icon, type, name, value, onChange, placeholder }) => (
  <div className="space-y-3">
    <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
      {label}
    </label>
    <div className="relative group/input">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-accent transition-colors" />
      <input
        type={type}
        name={name}
        required
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-6 py-4 bg-surface-2 border border-white/5 text-[11px] font-mono text-white placeholder-white/5 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
      />
    </div>
  </div>
);

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      navigate('/home');
    } catch (error) {
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value.toUpperCase(),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4 py-12 relative overflow-hidden">
      
      {/* Background Kinetic Elements */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none surface-dot-grid" />
      <div className="absolute top-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg relative z-10"
      >
        {/* Header - Identity */}
        <div className="flex flex-col items-center mb-12">
          <Link to="/" className="mb-10">
            <Logo />
          </Link>
          <div className="flex items-center gap-3 mb-2">
             <Terminal className="w-4 h-4 text-accent" />
             <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Node_Initialization // Protocol_4</span>
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">
            System <span className="text-accent italic">Registration</span>
          </h1>
        </div>

        {/* Signup Card - Industrial Form */}
        <div className="bg-surface-1 border border-white/[0.05] p-10 relative overflow-hidden group shadow-2xl">
          {/* CRT Scanline */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Full Name" 
                icon={User} 
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                placeholder="John Doe" 
              />
              <InputField 
                label="Company Name" 
                icon={Building} 
                type="text" 
                name="company" 
                value={formData.company} 
                onChange={handleChange} 
                placeholder="Acme Corp" 
              />
            </div>

            <InputField 
              label="Email Address" 
              icon={Mail} 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="john@example.com" 
            />

            <div className="grid md:grid-cols-2 gap-6">
              <InputField 
                label="Password" 
                icon={Lock} 
                type="password" 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                placeholder="••••••••" 
              />
              <InputField 
                label="Confirm Password" 
                icon={Shield} 
                type="password" 
                name="confirmPassword" 
                value={formData.confirmPassword} 
                onChange={handleChange} 
                placeholder="••••••••" 
              />
            </div>

            <div className="flex items-start group/terms">
               <div className="relative w-5 h-5 border border-white/10 flex items-center justify-center group-hover/terms:border-accent/40 transition-all mt-1">
                  <input type="checkbox" required className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                  <div className="w-2 h-2 bg-accent opacity-0 peer-checked:opacity-100 transition-opacity" />
               </div>
              <label className="ml-4 text-[9px] font-mono text-white/20 uppercase tracking-widest leading-relaxed">
                I_AUTHORIZE_THE_SYSTEM_TO_PROVISION_MODULES_ACCORDING_TO_THE{' '}
                <a href="#" className="font-black text-accent/60 hover:text-accent transition-colors">SERVICE_PROTOCOLS</a>{' '}
                AND{' '}
                <a href="#" className="font-black text-accent/60 hover:text-accent transition-colors">DATA_CLEARANCE_ACT</a>.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-accent hover:bg-accent-dim text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 group/btn overflow-hidden relative"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  PROVISIONING...
                </>
              ) : (
                <>
                  Create Account
                  <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-2 transition-transform" />
                </>
              )}
              {/* Kinetic Button Glow */}
              <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
            </button>
          </form>

          {/* SSO Providers */}
          <div className="mt-8 relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span className="px-4 text-[9px] font-mono text-white/20 uppercase tracking-widest">Or Continue With</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>
            
            <div className="flex gap-4">
              <a 
                href={`${API_BASE}/api/v1/auth/google`}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
              >
                <GoogleIcon /> Google
              </a>
              <a 
                href={`${API_BASE}/api/v1/auth/github`}
                className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
              >
                <Github className="w-4 h-4" /> GitHub
              </a>
            </div>

            <button 
              onClick={() => navigate('/home')}
              className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all flex items-center justify-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/60 hover:text-white"
            >
              Continue as Guest
            </button>
          </div>

          <div className="mt-10 text-center relative z-10">
            <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest">
              Already have an account?{' '}
              <Link
                to="/login"
                className="font-black text-accent/60 hover:text-accent transition-colors ml-2 underline underline-offset-4"
              >
                Sign In
              </Link>
            </p>
          </div>

          {/* Kinetic Border */}
          <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/[0.02]" />
          <div className="absolute bottom-0 left-0 h-[1px] bg-accent w-0 group-hover:w-full transition-all duration-700" />
        </div>

        {/* Footer Info */}
        <div className="mt-12 text-center">
          <Link
            to="/"
            className="text-[9px] font-mono text-white/10 hover:text-white uppercase tracking-[0.4em] transition-all"
          >
            ← RETURN_TO_SYSTEM_ROOT
          </Link>
        </div>
      </motion.div>
    </div>
  );
};