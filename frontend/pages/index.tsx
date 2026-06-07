import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, Users, Briefcase, Zap } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          RecruitAI
        </h1>
        <Link href="/login">
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">
            Login
          </button>
        </Link>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          className="text-center max-w-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.h1
            className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            AI-Powered Resume Screening & Recruitment Analytics
          </motion.h1>

          <motion.p
            className="text-xl text-slate-300 mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Transform your hiring process with intelligent resume parsing, skill
            matching, and comprehensive analytics to find the perfect candidates
            faster than ever.
          </motion.p>

          <motion.div
            className="flex flex-col md:flex-row gap-6 justify-center mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/signup">
              <motion.button
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all flex items-center justify-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started <ArrowRight size={20} />
              </motion.button>
            </Link>
            <Link href="/login">
              <button className="px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-all border border-white/20">
                Sign In
              </button>
            </Link>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <Zap className="text-yellow-400 mb-4 mx-auto" size={32} />
              <h3 className="font-semibold text-white mb-2">Fast Parsing</h3>
              <p className="text-sm text-slate-300">
                Parse resumes in seconds using advanced NLP
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <Users className="text-blue-400 mb-4 mx-auto" size={32} />
              <h3 className="font-semibold text-white mb-2">Smart Matching</h3>
              <p className="text-sm text-slate-300">
                Match candidates with job requirements instantly
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <BarChart3 className="text-green-400 mb-4 mx-auto" size={32} />
              <h3 className="font-semibold text-white mb-2">Analytics</h3>
              <p className="text-sm text-slate-300">
                Get deep insights into your hiring metrics
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6">
              <Briefcase className="text-purple-400 mb-4 mx-auto" size={32} />
              <h3 className="font-semibold text-white mb-2">ATS Ready</h3>
              <p className="text-sm text-slate-300">
                Export data for your existing HR systems
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-slate-400">
        <p>&copy; 2024 RecruitAI. All rights reserved.</p>
      </footer>
    </div>
  );
}
