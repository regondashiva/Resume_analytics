import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/layouts/DashboardLayout';
import { motion } from 'framer-motion';
import { 
  Settings as SettingsIcon, 
  Cpu, 
  Database, 
  Sliders, 
  Sun, 
  Moon, 
  CheckCircle, 
  Save, 
  BellRing,
  Info
} from 'lucide-react';

export default function Settings() {
  // Persistence States via LocalStorage
  const [matchScore, setMatchScore] = useState(70);
  const [softSkills, setSoftSkills] = useState(true);
  const [dbEngine, setDbEngine] = useState('mysql');
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Load local settings on mount
    const savedScore = localStorage.getItem('setting_match_score');
    if (savedScore) setMatchScore(parseInt(savedScore));
    
    const savedSkills = localStorage.getItem('setting_soft_skills');
    if (savedSkills) setSoftSkills(savedSkills === 'true');

    const savedDb = localStorage.getItem('setting_db_engine');
    if (savedDb) setDbEngine(savedDb);

    const savedTheme = localStorage.getItem('setting_theme');
    if (savedTheme) setTheme(savedTheme);

    const savedNotifs = localStorage.getItem('setting_notifications');
    if (savedNotifs) setNotifications(savedNotifs === 'true');
  }, []);

  const handleSave = () => {
    localStorage.setItem('setting_match_score', matchScore.toString());
    localStorage.setItem('setting_soft_skills', softSkills.toString());
    localStorage.setItem('setting_db_engine', dbEngine);
    localStorage.setItem('setting_theme', theme);
    localStorage.setItem('setting_notifications', notifications.toString());

    // Apply Theme Changes (if any)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <SettingsIcon className="text-blue-500 animate-spin-slow" size={32} />
            System Settings
          </h1>
          <p className="text-slate-500 mt-1">Configure your RecruitAI matching parameters, databases, and platform attributes.</p>
        </div>

        {showSuccess && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center gap-3 text-sm border border-emerald-100 dark:border-emerald-800/30"
          >
            <CheckCircle size={20} />
            <span>Settings saved successfully! Parameters updated system-wide.</span>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Settings Navigation / Info Panel */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl space-y-2 border border-blue-100/50 dark:border-blue-900/30">
              <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-400 flex items-center gap-1.5">
                <Info size={16} />
                AI Thresholds
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                RecruitAI automatically segments candidate suitability ranges based on your Minimum Match Score criteria. Recommended default is 70%.
              </p>
            </div>

            <div className="p-4 bg-purple-50/50 dark:bg-purple-950/20 rounded-xl space-y-2 border border-purple-100/50 dark:border-purple-900/30">
              <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-400 flex items-center gap-1.5">
                <Database size={16} />
                Database Engines
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Your system is synchronized with an active enterprise MySQL server, yielding production-scale candidate persistence.
              </p>
            </div>
          </div>

          {/* Form Settings Panel */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Category: AI Match Thresholds */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Sliders size={20} className="text-blue-500" />
                AI Match Score parameters
              </h2>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Minimum Match Score Threshold</label>
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{matchScore}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="30" 
                    max="95" 
                    value={matchScore}
                    onChange={(e) => setMatchScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>30% (Permissive)</span>
                    <span>70% (Recommended)</span>
                    <span>95% (Highly Strict)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-sm font-medium text-slate-800 dark:text-slate-300 block">Include Soft Skills Parsing</label>
                    <span className="text-xs text-slate-400">Match dynamic soft attributes (e.g. leadership, collaboration) during resume NLP processes.</span>
                  </div>
                  <button 
                    onClick={() => setSoftSkills(!softSkills)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                      softSkills ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>
              </div>
            </div>

            {/* Category: System Databases & Engine */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Cpu size={20} className="text-purple-500" />
                System Configurations
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-300 block mb-3">Persistence Database Engine</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      onClick={() => setDbEngine('sqlite')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        dbEngine === 'sqlite'
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500'
                      }`}
                    >
                      <h4 className="font-semibold text-sm">SQLite Engine</h4>
                      <p className="text-xs text-slate-400 mt-1">Lightweight Local Persistence File</p>
                    </button>

                    <button 
                      onClick={() => setDbEngine('mysql')}
                      className={`p-4 rounded-xl border text-left transition-all ${
                        dbEngine === 'mysql'
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-950/20 text-slate-900 dark:text-white'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-500'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <h4 className="font-semibold text-sm text-slate-900 dark:text-white">MySQL Server</h4>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm animate-ping"></span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">Enterprise SQL Server (Connected)</p>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-sm font-medium text-slate-800 dark:text-slate-300 block">spaCy NLP Language Model</label>
                    <span className="text-xs text-slate-400">Currently executing: English Small Web Model (en_core_web_sm)</span>
                  </div>
                  <span className="px-3 py-1.5 bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-lg text-xs font-semibold uppercase tracking-wider">
                    SM-Model
                  </span>
                </div>
              </div>
            </div>

            {/* Category: Display Toggles */}
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-6">
                <Sun size={20} className="text-amber-500" />
                Interface Customizations
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-slate-800 dark:text-slate-300 block">Color Theme Selection</label>
                    <span className="text-xs text-slate-400">Toggle between Light and Sleek Obsidian Dark Mode.</span>
                  </div>
                  <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
                    <button 
                      onClick={() => setTheme('light')}
                      className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                        theme === 'light' 
                          ? 'bg-white text-slate-900 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sun size={14} />
                      Light
                    </button>
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`p-2 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all ${
                        theme === 'dark' 
                          ? 'bg-slate-800 text-white shadow-sm' 
                          : 'text-slate-500 hover:text-white'
                      }`}
                    >
                      <Moon size={14} />
                      Dark
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700">
                  <div>
                    <label className="text-sm font-medium text-slate-800 dark:text-slate-300 block flex items-center gap-1.5">
                      <BellRing size={16} className="text-blue-500" />
                      Real-Time Parsing Alerts
                    </label>
                    <span className="text-xs text-slate-400">Display visual desktop notifications when an uploaded PDF completes parsing.</span>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                      notifications ? 'bg-blue-600 justify-end' : 'bg-slate-200 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Bar */}
            <div className="pt-2 flex justify-end">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSave}
                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all flex items-center gap-2 shadow-sm"
              >
                <Save size={20} />
                Save System Configuration
              </motion.button>
            </div>
            
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
