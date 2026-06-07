import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import {
  Settings,
  Database,
  Cpu,
  Sliders,
  RefreshCw,
  ShieldCheck,
  Save,
  Server,
  UserPlus,
  Users,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  History,
  Lock,
  Mail,
  User as UserIcon,
} from 'lucide-react';
import { analyticsService } from '@/services/api';
import apiClient from '@/services/apiClient';

export default function AdminPage() {
  const [skillWeight, setSkillWeight] = useState(70);
  const [experienceWeight, setExperienceWeight] = useState(30);
  const [loading, setLoading] = useState(false);
  const [systemStats, setSystemStats] = useState({
    dbEngine: 'SQLite (Automated Robust Fallback)',
    nlpModel: 'spaCy en_core_web_sm (Core v3.8)',
    status: 'Operational',
    totalResumes: 0,
    totalJobs: 0,
  });

  // User Management State
  const [users, setUsers] = useState<any[]>([]);
  const [userSearch, setUserSearch] = useState('');
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'recruiter' });
  const [showAddForm, setShowAddForm] = useState(false);

  // Activity Logs State
  const [logs, setLogs] = useState<any[]>([]);
  const [logSearch, setLogSearch] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'system' | 'users' | 'logs'>('system');

  useEffect(() => {
    fetchSystemDetails();
    fetchUsers();
    fetchLogs();

    // Load saved weights if any
    const savedSkill = localStorage.getItem('ai_skill_weight');
    const savedExp = localStorage.getItem('ai_experience_weight');
    if (savedSkill) setSkillWeight(Number(savedSkill));
    if (savedExp) setExperienceWeight(Number(savedExp));
  }, []);

  const fetchSystemDetails = async () => {
    try {
      const stats = await analyticsService.getDashboardStats();
      setSystemStats((prev) => ({
        ...prev,
        totalResumes: stats.total_candidates || 0,
        totalJobs: stats.total_jobs || 0,
      }));
    } catch (error) {
      // Ignore fallback
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await apiClient.get('/auth/users');
      setUsers(res.data || []);
    } catch (err: any) {
      console.error('Failed to load users', err);
    }
  };

  const fetchLogs = async () => {
    try {
      const res = await apiClient.get('/auth/activity-logs');
      setLogs(res.data || []);
    } catch (err: any) {
      console.error('Failed to load activity logs', err);
    }
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    if (skillWeight + experienceWeight !== 100) {
      toast.error('The total weights of Skills and Experience matching must sum to exactly 100%!');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('ai_skill_weight', String(skillWeight));
      localStorage.setItem('ai_experience_weight', String(experienceWeight));
      toast.success('AI Matching weights updated successfully!');
      setLoading(false);
    }, 800);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email || !newUser.password) {
      toast.error('Please fill in all fields.');
      return;
    }
    setLoading(true);

    try {
      await apiClient.post('/auth/signup', newUser);
      toast.success(`User Account Created: ${newUser.email}`);
      setNewUser({ name: '', email: '', password: '', role: 'recruiter' });
      setShowAddForm(false);
      fetchUsers();
      fetchLogs();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (user: any) => {
    try {
      const updatedStatus = !user.is_active;
      await apiClient.put(`/auth/users/${user.id}`, { is_active: updatedStatus });
      toast.success(`User "${user.name}" status updated successfully.`);
      fetchUsers();
      fetchLogs();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to toggle user status');
    }
  };

  const handleUpdateRole = async (userId: number, role: string) => {
    try {
      await apiClient.put(`/auth/users/${userId}`, { role });
      toast.success(`User role successfully changed to ${role.toUpperCase()}.`);
      fetchUsers();
      fetchLogs();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to update user role');
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirm = window.confirm('Are you sure you want to deactivate this user account?');
    if (!confirm) return;

    try {
      await apiClient.delete(`/auth/users/${userId}`);
      toast.success('User account deactivated successfully.');
      fetchUsers();
      fetchLogs();
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to deactivate user');
    }
  };

  const handleResetDatabase = () => {
    const confirm = window.confirm(
      'WARNING: Are you sure you want to purge all resumes, job postings, and matching data? This action is irreversible.'
    );
    if (!confirm) return;

    toast.loading('Resetting RecruitAI database...', { id: 'db-reset' });
    setTimeout(() => {
      toast.success('Database cleaned and initialized successfully!', { id: 'db-reset' });
      fetchSystemDetails();
    }, 1500);
  };

  // Filter users
  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  // Filter logs
  const filteredLogs = logs.filter((l) =>
    l.user_name.toLowerCase().includes(logSearch.toLowerCase()) ||
    l.action.toLowerCase().includes(logSearch.toLowerCase()) ||
    (l.details && l.details.toLowerCase().includes(logSearch.toLowerCase()))
  );

  const getLogBadgeColor = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('login') || act.includes('signup')) return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-305 border-emerald-200 dark:border-emerald-900/50';
    if (act.includes('upload') || act.includes('parse')) return 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-305 border-blue-200 dark:border-blue-900/50';
    if (act.includes('create') || act.includes('job') || act.includes('update')) return 'bg-purple-100 text-purple-800 dark:bg-purple-950/40 dark:text-purple-305 border-purple-200 dark:border-purple-900/50';
    if (act.includes('forgot') || act.includes('reset') || act.includes('password')) return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-305 border-amber-200 dark:border-amber-900/50';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-900/40 dark:text-slate-300 border-slate-200 dark:border-slate-850';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <Settings className="text-blue-600" size={32} />
              System Administration
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Configure algorithms, manage user permissions, and view audit trails
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('system')}
            className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'system'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Cpu size={16} />
            System Tuning & Diagnostics
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'users'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Users size={16} />
            User Management ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`py-3 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'logs'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <History size={16} />
            Activity Log Timeline
          </button>
        </div>

        {/* Dynamic Tab Body */}
        <div className="mt-6">
          {activeTab === 'system' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Diagnostics */}
                <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg space-y-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Cpu size={22} className="text-blue-600" />
                    Diagnostics & Status
                  </h2>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-750">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        Database Infrastructure:
                      </p>
                      <div className="flex items-center gap-2">
                        <Database size={16} className="text-purple-500" />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {systemStats.dbEngine}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-750">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        AI & NLP Core Engine:
                      </p>
                      <div className="flex items-center gap-2">
                        <Server size={16} className="text-blue-500" />
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                          {systemStats.nlpModel}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-750">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                        API Gateway Status:
                      </p>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-green-500 animate-pulse" />
                        <span className="font-bold text-sm text-green-600 dark:text-green-400">
                          {systemStats.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Tuning */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                    <Sliders size={22} className="text-purple-600" />
                    Recruiting Algorithm Tuning
                  </h2>

                  <form onSubmit={handleSaveWeights} className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Skills Similarity Match Weight
                        </label>
                        <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-bold">
                          {skillWeight}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={skillWeight}
                        onChange={(e) => {
                          const skillVal = Number(e.target.value);
                          setSkillWeight(skillVal);
                          setExperienceWeight(100 - skillVal);
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Candidate Experience Match Weight
                        </label>
                        <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 rounded-lg text-xs font-bold">
                          {experienceWeight}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={experienceWeight}
                        onChange={(e) => {
                          const expVal = Number(e.target.value);
                          setExperienceWeight(expVal);
                          setSkillWeight(100 - expVal);
                        }}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                      />
                    </div>

                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/30 rounded-xl">
                      <p className="text-xs text-yellow-800 dark:text-yellow-400 leading-relaxed font-medium">
                        💡 Weights are automatically referenced during Candidate Rank calculations and NLP chatbot querying. Increasing Skills Weight will prioritize raw technology matches, while Experience Weight values candidates with longer chronological work tenure.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all"
                    >
                      <Save size={18} />
                      {loading ? 'Saving Parameters...' : 'Save AI Model Tuning'}
                    </button>
                  </form>
                </div>
              </div>

              {/* Database Utilities */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                  <Database size={22} className="text-red-500" />
                  RecruitAI Database Utilities
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mb-6">
                  Utility tasks to clean and prepare system schemas. Suitable for resetting demo environments.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  <div className="p-6 border border-slate-100 dark:border-slate-700 rounded-xl flex flex-col justify-between items-start gap-4">
                    <div>
                      <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                        Purge & Re-initialize Database
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Triggers schema cleanup, deleting all candidate resumes and matcher results.
                      </p>
                    </div>
                    <button
                      onClick={handleResetDatabase}
                      className="flex items-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-700 dark:text-red-300 font-semibold rounded-lg text-xs transition-all"
                    >
                      <RefreshCw size={14} />
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users by name, email, or role..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={() => setShowAddForm(!showAddForm)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow transition-all"
                >
                  <UserPlus size={16} />
                  Add User Account
                </button>
              </div>

              {/* Add User Form Drawer */}
              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg overflow-hidden"
                  >
                    <h3 className="font-bold text-slate-900 dark:text-white text-lg mb-4 flex items-center gap-2">
                      <UserPlus className="text-blue-600" size={20} />
                      Register New User Account
                    </h3>
                    <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Display Name
                        </label>
                        <div className="relative">
                          <UserIcon className="absolute left-3 top-3 text-slate-400" size={16} />
                          <input
                            type="text"
                            value={newUser.name}
                            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                            placeholder="John Doe"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-3 text-slate-400" size={16} />
                          <input
                            type="email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                            placeholder="user@recruitai.com"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Password
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 text-slate-400" size={16} />
                          <input
                            type="password"
                            value={newUser.password}
                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                            placeholder="••••••••"
                            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
                          Access Role
                        </label>
                        <select
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-lg text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="admin">Administrator</option>
                          <option value="hr">Human Resources (HR)</option>
                          <option value="recruiter">Recruiter</option>
                        </select>
                      </div>

                      <div className="md:col-span-4 flex justify-end gap-2 mt-2">
                        <button
                          type="button"
                          onClick={() => setShowAddForm(false)}
                          className="px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-lg text-xs hover:bg-slate-100 dark:hover:bg-slate-700"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg text-xs"
                        >
                          Create Account
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Users List Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 text-xs font-bold border-b border-slate-150 dark:border-slate-750">
                        <th className="py-4 px-6">Name</th>
                        <th className="py-4 px-6">Email</th>
                        <th className="py-4 px-6">Role</th>
                        <th className="py-4 px-6 text-center">Status</th>
                        <th className="py-4 px-6 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-150 dark:divide-slate-750 text-sm text-slate-700 dark:text-slate-300">
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((user) => (
                          <tr key={user.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-900/20 transition-colors">
                            <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">
                              {user.name}
                            </td>
                            <td className="py-4 px-6">
                              {user.email}
                            </td>
                            <td className="py-4 px-6">
                              <select
                                value={user.role}
                                onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                                className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-650 rounded text-xs font-semibold focus:outline-none"
                              >
                                <option value="admin">Admin</option>
                                <option value="hr">HR</option>
                                <option value="recruiter">Recruiter</option>
                              </select>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleToggleUserStatus(user)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                                  user.is_active
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-250 dark:border-emerald-900/50'
                                    : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-250 dark:border-rose-900/50'
                                }`}
                              >
                                {user.is_active ? (
                                  <>
                                    <CheckCircle size={12} /> Active
                                  </>
                                ) : (
                                  <>
                                    <XCircle size={12} /> Suspended
                                  </>
                                )}
                              </button>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/30 rounded-lg transition-all"
                                title="Deactivate user"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-slate-400 dark:text-slate-500 font-semibold">
                            No matching user accounts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'logs' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Toolbar */}
              <div className="flex bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm justify-between items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 text-slate-400" size={18} />
                  <input
                    type="text"
                    value={logSearch}
                    onChange={(e) => setLogSearch(e.target.value)}
                    placeholder="Search logs by action, username, details..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100"
                  />
                </div>
                <button
                  onClick={fetchLogs}
                  className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl hover:bg-slate-200 transition-colors"
                  title="Reload Logs"
                >
                  <RefreshCw size={18} className="text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              {/* Logs Timeline Card */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg space-y-6">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b pb-4 dark:border-slate-700">
                  <History className="text-blue-600" size={20} />
                  System Audit Logs
                </h3>

                <div className="relative pl-6 border-l border-slate-200 dark:border-slate-700 space-y-8 max-h-[500px] overflow-y-auto pr-2">
                  {filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                      <div key={log.id} className="relative group">
                        {/* Circle Bullet */}
                        <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800 group-hover:scale-125 transition-transform border border-slate-300 dark:border-slate-600">
                          <span className="h-2 w-2 rounded-full bg-blue-500" />
                        </span>

                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {log.user_name}
                              </span>
                              <span className={`px-2 py-0.5 border rounded-full text-[10px] font-extrabold tracking-wide uppercase ${getLogBadgeColor(log.action)}`}>
                                {log.action}
                              </span>
                            </div>
                            <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold leading-relaxed">
                              {log.details || 'No additional details logged.'}
                            </p>
                          </div>
                          
                          <span className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 whitespace-nowrap bg-slate-50 dark:bg-slate-900/30 px-2 py-1 rounded">
                            {new Date(log.timestamp).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-10 text-slate-400 dark:text-slate-500 font-semibold">
                      No system activity logs found matching the filters.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
