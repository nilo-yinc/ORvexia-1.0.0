import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { User, Mail, Shield, Bell, Palette, LogOut, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Settings = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const notifications = [
    { label: 'Workflow Completion', description: 'Get notified when workflows complete', checked: true },
    { label: 'Error Alerts', description: 'Receive alerts when workflows fail', checked: true },
    { label: 'Weekly Reports', description: 'Get weekly performance summaries', checked: false },
    { label: 'System Updates', description: 'News about new features and updates', checked: true },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#111111] p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your account and preferences
          </p>
        </div>

        {/* Profile */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <User className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Profile Information
              </h2>
            </div>

            <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200 dark:border-[#1a1a1a]">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-[#2a2a2a]"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user?.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user?.email}
                </p>
                <span className="inline-block mt-2 px-3 py-1 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-500 text-xs font-medium rounded-full">
                  {user?.role}
                </span>
              </div>
              <button className="px-4 py-2 border border-gray-200 dark:border-[#1a1a1a] text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition">
                Change Photo
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    defaultValue={user?.name}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    defaultValue={user?.email}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a] rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                  />
                </div>
              </div>

              <button className="px-4 py-2 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition">
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Appearance
              </h2>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white mb-1">
                  Theme
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Current theme: {theme === 'dark' ? 'Dark' : 'Light'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className="px-4 py-2 border border-gray-200 dark:border-[#2a2a2a] text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-[#222222] transition"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
            </div>

            <div className="space-y-4">
              {notifications.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-[#1a1a1a] last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {item.label}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {item.description}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" defaultChecked={item.checked} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-[#2a2a2a] peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Security */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a] rounded-lg p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-orange-600 dark:text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Security
              </h2>
            </div>

            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-[#1a1a1a] rounded-lg text-left hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Change Email</p>
                  <p className="text-xs text-gray-500">Update your email address</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-[#1a1a1a] rounded-lg text-left hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition">
                <Key className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Change Password</p>
                  <p className="text-xs text-gray-500">Update your password</p>
                </div>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-[#1a1a1a] rounded-lg text-left hover:bg-[#fafafa] dark:hover:bg-[#0a0a0a] transition">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white text-sm">Two-Factor Authentication</p>
                  <p className="text-xs text-gray-500">Add an extra layer of security</p>
                </div>
              </button>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <div className="bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <LogOut className="w-5 h-5 text-red-600 dark:text-red-500" />
              <h2 className="text-lg font-semibold text-red-900 dark:text-red-500">
                Danger Zone
              </h2>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
              <button className="w-full px-4 py-3 border-2 border-red-600 text-red-600 font-medium rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition">
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};