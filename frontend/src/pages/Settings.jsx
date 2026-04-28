import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  User, Mail, Shield, Bell, LogOut, Lock, 
  Camera, Check, AlertCircle, Loader2, Key, Trash2,
  ChevronRight, ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SettingPanel = ({ title, description, icon: Icon, children, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
    className="bg-surface-1 border border-white/[0.05] p-8 relative overflow-hidden group"
  >
    <div className="flex items-start justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 flex items-center justify-center bg-surface-2 border border-white/5 group-hover:border-accent/40 transition-all">
          <Icon className="w-5 h-5 text-white/40 group-hover:text-accent" />
        </div>
        <div>
          <h2 className="text-[12px] font-black text-white uppercase tracking-[0.2em]">{title}</h2>
          <p className="text-[10px] font-mono text-white/20 uppercase tracking-widest mt-1">{description}</p>
        </div>
      </div>
    </div>
    {children}
  </motion.div>
);

export const Settings = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [email] = useState(user?.email || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Password State
  const [passStep, setPassStep] = useState('none'); // 'none', 'otp', 'reset'
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    setName(user?.name || '');
    setAvatar(user?.avatar || '');
  }, [user?.name, user?.avatar]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 1MB' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatar('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const saveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      await updateProfile(name, avatar);
      setMessage({ type: 'success', text: 'Profile updated successfully' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Update failed' });
    } finally {
      setLoading(false);
    }
  };

  const requestPassOTP = async () => {
    setPassLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const res = await axios.post(`${API_BASE}/api/v1/users/forgot-password`, 
        { email: user.email },
        { withCredentials: true }
      );
      if (res.data.status) {
        setPassStep('otp');
        setMessage({ type: 'success', text: 'Verification code sent to your email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send verification code' });
    } finally {
      setPassLoading(false);
    }
  };

  const verifyAndReset = async () => {
    setPassLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/api/v1/users/reset-password`, 
        {
          email: user.email,
          otp,
          newPassword
        },
        { withCredentials: true }
      );
      if (res.data.status) {
        setPassStep('none');
        setOtp('');
        setNewPassword('');
        setMessage({ type: 'success', text: 'Password changed successfully' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Invalid code' });
    } finally {
      setPassLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian pb-24">
      <div className="max-w-[800px] mx-auto px-6 pt-12">
        
        {/* Simple Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <SettingsIcon className="w-4 h-4 text-accent" />
            <span className="text-[10px] font-mono text-white/20 uppercase tracking-[0.4em]">Account Settings</span>
          </div>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">
            Profile <span className="text-accent italic">Settings</span>
          </h1>
        </div>

        {/* Global Feedback */}
        <AnimatePresence>
          {message.text && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-8 p-4 border flex items-center gap-3 ${
                message.type === 'success' ? 'bg-accent/10 border-accent/20 text-accent' : 'bg-red-500/10 border-red-500/20 text-red-500'
              }`}
            >
              {message.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Personal Info */}
          <SettingPanel title="Personal Information" description="Update your basic profile details" icon={User} index={0}>
            <div className="flex flex-col md:flex-row items-start gap-12">
              {/* Avatar Upload */}
              <div className="relative group">
                <div className="w-32 h-32 bg-surface-2 border border-white/5 flex items-center justify-center overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-12 h-12 text-white/5" />
                  )}
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Camera className="w-6 h-6 text-white mb-2" />
                    <span className="text-[8px] font-black text-white uppercase tracking-widest">Change Photo</span>
                  </button>
                </div>
                {avatar && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="mt-3 w-32 py-2 border border-white/10 hover:border-red-500/40 text-white/40 hover:text-red-400 text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                )}
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              </div>

              {/* Form Fields */}
              <div className="flex-1 w-full space-y-6">
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-surface-2 border border-white/5 pl-12 pr-4 py-4 text-[11px] font-mono text-white tracking-widest focus:outline-none focus:border-accent/40" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">Email Address</label>
                  <div className="relative opacity-50">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/10" />
                    <input 
                      type="email" 
                      value={email}
                      disabled
                      className="w-full bg-surface-2 border border-white/5 pl-12 pr-4 py-4 text-[11px] font-mono text-white tracking-widest cursor-not-allowed" 
                    />
                  </div>
                </div>
                <button 
                  onClick={saveProfile}
                  disabled={loading}
                  className="px-10 py-4 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </SettingPanel>

          {/* Security / Password */}
          <SettingPanel title="Security & Privacy" description="Manage your password and authentication" icon={Shield} index={1}>
            <div className="bg-surface-2/50 border border-white/[0.03] p-6">
              {passStep === 'none' && (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Update Password</h3>
                    <p className="text-[9px] font-mono text-white/20 uppercase tracking-widest mt-1">Change your security credentials via email</p>
                  </div>
                  <button 
                    onClick={requestPassOTP}
                    disabled={passLoading}
                    className="px-6 py-3 border border-white/10 hover:border-accent text-white/60 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {passLoading ? 'Sending...' : 'Request Code'}
                  </button>
                </div>
              )}

              {passStep === 'otp' && (
                <div className="space-y-6">
                  <div className="flex items-center gap-2 mb-4">
                    <button onClick={() => setPassStep('none')} className="text-accent hover:text-white transition-colors">
                      <ArrowLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Verify Identity</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">6-Digit Code</label>
                      <input 
                        type="text" 
                        placeholder="123456"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        className="w-full bg-surface-2 border border-white/5 p-4 text-[11px] font-mono text-white tracking-[0.5em] focus:outline-none focus:border-accent/40" 
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">New Password</label>
                      <input 
                        type="password" 
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-surface-2 border border-white/5 p-4 text-[11px] font-mono text-white tracking-widest focus:outline-none focus:border-accent/40" 
                      />
                    </div>
                  </div>
                  <button 
                    onClick={verifyAndReset}
                    disabled={passLoading}
                    className="w-full py-4 bg-accent hover:bg-accent-dim text-white text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    {passLoading ? 'Verifying...' : 'Complete Reset'}
                  </button>
                </div>
              )}
            </div>
          </SettingPanel>

          {/* Danger Zone */}
          <div className="bg-red-500/5 border border-red-500/10 p-8 flex items-center justify-between">
            <div>
              <h3 className="text-[10px] font-black text-red-500 uppercase tracking-widest">Sign Out</h3>
              <p className="text-[9px] font-mono text-red-500/40 uppercase tracking-widest mt-1">End your current session safely</p>
            </div>
            <button 
              onClick={handleLogout}
              className="px-8 py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest transition-all"
            >
              Logout Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingsIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
