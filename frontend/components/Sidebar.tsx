import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import {
  BarChart3,
  FileText,
  Briefcase,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bot,
} from 'lucide-react';
import { useAuthStore } from '@/context/authStore';

const sidebarItems = [
  { icon: BarChart3, label: 'Dashboard', href: '/dashboard' },
  { icon: FileText, label: 'Upload Resume', href: '/upload-resume' },
  { icon: Briefcase, label: 'Job Descriptions', href: '/job-descriptions' },
  { icon: Users, label: 'Candidates', href: '/candidates' },
  { icon: Bot, label: 'AI Chatbot', href: '/ai-chatbot' },
  { icon: BarChart3, label: 'Analytics', href: '/analytics' },
  { icon: FileText, label: 'Reports', href: '/reports' },
  { icon: Settings, label: 'Admin', href: '/admin' },
];

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { logout, user } = useAuthStore();

  const role = user?.role || 'recruiter';

  // Filter sidebar items dynamically based on role permissions
  const filteredItems = sidebarItems.filter((item) => {
    if (role === 'admin') return true;
    if (role === 'hr') {
      // HR Permissions: Upload resumes, candidates rankings, jobs, chatbot, profile, settings
      return item.label !== 'Admin' && item.label !== 'Analytics';
    }
    if (role === 'recruiter') {
      // Recruiter Permissions: Dashboard, Candidates directory, Chatbot, Profile, Settings
      return ['Dashboard', 'Candidates', 'AI Chatbot', 'Profile', 'Settings'].includes(item.label);
    }
    return false;
  });

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 text-white bg-slate-800 p-2 rounded-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <motion.div
        className={`fixed md:relative w-64 h-screen bg-gradient-to-b from-slate-800 to-slate-900 text-white overflow-y-auto ${
          isOpen ? 'left-0' : '-left-64'
        } md:left-0 z-40`}
        animate={{ x: mounted && isMobile ? (isOpen ? 0 : -256) : 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            RecruitAI
          </h1>
          <p className="text-xs text-slate-400 mt-1">Smart Recruitment</p>
          {mounted && user && (
            <div className="mt-3 px-2 py-1 bg-white/10 border border-white/10 rounded-lg text-2xs font-extrabold uppercase tracking-widest text-slate-300 inline-block">
              Role: {user.role}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {mounted && filteredItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <motion.div
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                  router.pathname === item.href
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`}
                whileHover={{ x: 4 }}
              >
                <item.icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </motion.div>
            </Link>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700">
          <motion.button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut size={20} />
            <span className="text-sm font-medium">Logout</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/30 md:hidden z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
