import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { useAuthStore } from '@/context/authStore';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Save, CheckCircle, BarChart3, Briefcase, FileText } from 'lucide-react';
import axios from 'axios';

export default function Profile() {
  const { user, token, setAuth } = useAuthStore();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [stats, setStats] = useState({
    totalCandidates: 0,
    openJobs: 0,
    selected: 0,
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  // Load live Recruiter Stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/analytics/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats({
          totalCandidates: response.data.total_candidates || 0,
          openJobs: response.data.open_jobs || 0,
          selected: response.data.selected || 0,
        });
      } catch (err) {
        console.error('Failed to load profile stats:', err);
      }
    };
    if (token) {
      fetchStats();
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (password && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload: any = { name, email };
      if (password) {
        payload.password = password;
      }

      const response = await axios.put('http://localhost:8000/api/auth/update', payload, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      // Update state in our global AuthStore
      const updatedUser = response.data;
      setAuth(token!, updatedUser);
      setPassword('');
      setConfirmPassword('');
      setSuccessMsg('Profile updated successfully!');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">My Profile</h1>
          <p className="text-slate-500 mt-1">Manage your account information and track your hiring accomplishments.</p>
        </div>

        {/* Dynamic Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <FileText size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Resumes Processed</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.totalCandidates}</h3>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4"
          >
            <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-xl">
              <Briefcase size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Active Job Descriptions</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.openJobs}</h3>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ y: -4 }}
            className="p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4"
          >
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Selections</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{stats.selected}</h3>
            </div>
          </motion.div>
        </div>

        {/* Profile Card & Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar Panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-md">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <h3 className="text-xl font-bold text-slate-950 dark:text-white mt-4">{name || 'Recruiter'}</h3>
            <p className="text-sm text-slate-400 mt-1 capitalize flex items-center gap-1.5">
              <Shield size={14} className="text-blue-500" />
              Role: {user?.role || 'Recruiter'}
            </p>
            <div className="w-full border-t border-slate-100 dark:border-slate-700 my-6"></div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your profile is verified under the corporate recruitment program. For role mutations, please contact system administrators.
            </p>
          </div>

          {/* Form Panel */}
          <div className="md:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-950 dark:text-white mb-6">Account Details</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {successMsg && (
                <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg flex items-center gap-2 text-sm border border-emerald-100 dark:border-emerald-800/30">
                  <CheckCircle size={18} />
                  {successMsg}
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-100 dark:border-red-800/30">
                  {errorMsg}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    <input 
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      placeholder="e.g. Jane Doe"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Email Address</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="email@example.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-700 my-6 py-2"></div>

              <h3 className="text-sm font-semibold text-slate-500 uppercase mb-4">Security Options (Leave blank to keep current)</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">New Password</label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase mb-2">Confirm New Password</label>
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Save size={18} />
                  {loading ? 'Saving Changes...' : 'Save Account Settings'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
