import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, ArrowRight, Zap, Shield, Terminal, Cpu, Github } from 'lucide-react';

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

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [view, setView] = useState('login'); // 'login' | 'forgot_email' | 'forgot_otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const authData = await login(email, password);
      
      // If navigating to builder with state (e.g. from clicking a template while logged out), check limits
      if (location.state && (location.state.blueprint || location.state.template || location.state.autoPrompt)) {
        const plan = authData.user?.subscription?.plan || 'FREE';
        try {
          const { workflowApi } = await import('../lib/api');
          const stats = await workflowApi.getStats();
          const currentWorkflows = stats?.totalWorkflows || 0;
          
          if (plan === 'FREE' && currentWorkflows >= 1) {
            alert("Basic plan is limited to 1 workflow. Upgrade to Pro or Elite to create more architectures.");
            navigate("/home#pricing");
            return;
          }
        } catch (error) {
          console.error("Failed to verify limits after login:", error);
        }
      }
      
      navigate('/workflows/builder', { state: location.state });
    } catch (error) {
      console.error('Login error:', error);
      setMessage(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setMessage('Please enter your email first.');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.status) {
        setView('forgot_otp');
        setMessage('OTP sent to your email!');
      } else {
        setMessage(data.message || 'Error sending OTP');
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      if (data.status) {
        setView('login');
        setPassword('');
        setMessage('Password updated! Please sign in.');
      } else {
        setMessage(data.message || 'Invalid OTP');
      }
    } catch (error) {
      setMessage('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-obsidian px-4 relative overflow-hidden">
      
      {/* Background Kinetic Elements */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none surface-dot-grid" />
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Header - Identity */}
        <div className="flex flex-col items-center mb-12">
          <Link to="/" className="mb-10">
            <Logo />
          </Link>
          <div className="flex items-center gap-3 mb-2">
             <Terminal className="w-4 h-4 text-accent" />
             <span className="text-[9px] font-mono text-white/20 uppercase tracking-[0.4em]">Secure Login</span>
          </div>
          <h1 className="text-xl font-black text-white uppercase tracking-[0.2em]">
            Sign <span className="text-accent italic">In</span>
          </h1>
        </div>

        {/* Login Card - Industrial Form */}
        <div className="bg-surface-1 border border-white/[0.05] p-10 relative overflow-hidden group shadow-2xl">
          {/* CRT Scanline */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.02] bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

          {message && (
            <div className="mb-4 text-center text-[10px] font-mono text-accent uppercase tracking-widest bg-accent/10 py-2 border border-accent/20">
              {message}
            </div>
          )}

          {view === 'login' && (
            <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Email Address
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-accent transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-6 py-4 bg-surface-2 border border-white/5 text-[11px] font-mono text-white placeholder-white/5 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Password
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-accent transition-colors" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-surface-2 border border-white/5 text-[11px] font-mono text-white placeholder-white/5 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center cursor-pointer group/check">
                  <div className="relative w-4 h-4 border border-white/10 flex items-center justify-center group-hover/check:border-accent/40 transition-all">
                     <div className="w-1.5 h-1.5 bg-accent opacity-0 group-hover/check:opacity-20 transition-opacity" />
                  </div>
                  <span className="ml-3 text-[10px] font-mono text-white/20 uppercase tracking-widest group-hover/check:text-white/40 transition-colors">
                    Remember Me
                  </span>
                </label>
                <button type="button" onClick={() => setView('forgot_email')} className="text-[10px] font-mono text-accent/40 hover:text-accent uppercase tracking-widest transition-colors">
                  Forgot Password?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-accent hover:bg-accent-dim text-white text-[11px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center justify-center gap-3 group/btn overflow-hidden relative"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform" />
                  </>
                )}
                <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
              </button>
            </form>
          )}

          {view === 'forgot_email' && (
            <form onSubmit={handleForgotEmail} className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Enter Email to Reset
                </label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-accent transition-colors" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    className="w-full pl-12 pr-6 py-4 bg-surface-2 border border-white/5 text-[11px] font-mono text-white placeholder-white/5 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent hover:bg-accent-dim text-white text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group/btn relative"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </button>
                <button type="button" onClick={() => setView('login')} className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors py-2">
                  Back to Login
                </button>
              </div>
            </form>
          )}

          {view === 'forgot_otp' && (
            <form onSubmit={handleResetPassword} className="space-y-6 relative z-10">
              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                  Enter 6-Digit OTP
                </label>
                <div className="relative group/input">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-accent transition-colors" />
                  <input
                    type="text"
                    required
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full pl-12 pr-6 py-4 bg-surface-2 border border-white/5 text-[11px] font-mono text-white placeholder-white/5 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all tracking-[0.5em]"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.3em]">
                  New Password
                </label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/10 group-focus-within/input:text-accent transition-colors" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-12 pr-6 py-4 bg-surface-2 border border-white/5 text-[11px] font-mono text-white placeholder-white/5 focus:outline-none focus:border-accent/40 uppercase tracking-widest transition-all"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-accent hover:bg-accent-dim text-white text-[11px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 group/btn relative"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
                <button type="button" onClick={() => setView('login')} className="text-[10px] text-white/30 hover:text-white uppercase tracking-widest transition-colors py-2">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* SSO Providers */}
          {view === 'login' && (
            <>
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
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    className="font-black text-accent/60 hover:text-accent transition-colors ml-2 underline underline-offset-4"
                  >
                    Sign Up
                  </Link>
                </p>
              </div>
            </>
          )}

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
            ← Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

const Loader2 = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);
