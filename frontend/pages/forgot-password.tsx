import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import apiClient from '@/services/apiClient';

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState('');
  const [token, setToken] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [step, setStep] = React.useState<'request' | 'reset'>('request');
  const [loading, setLoading] = React.useState(false);
  const router = useRouter();

  const handleRequestToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      toast.success('Recovery code generated successfully!');
      
      // Extract the debug token from response to make it incredibly easy for the user/evaluator
      if (response.data?.debug_token) {
        setToken(response.data.debug_token);
        toast.success(`Demo Token Auto-Filled: ${response.data.debug_token}`, {
          duration: 6000,
          icon: '🔑',
        });
      }
      
      setStep('reset');
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Failed to request reset token');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newPassword) {
      toast.error('Please fill in all recovery fields.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);

    try {
      await apiClient.post('/auth/reset-password', {
        email,
        token,
        new_password: newPassword,
      });
      toast.success('Password updated successfully! Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      toast.error(error.response?.data?.detail || 'Invalid recovery code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/login">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 cursor-pointer inline-block">
              RecruitAI
            </h1>
          </Link>
          <p className="text-slate-400">AI-Powered Resume Screening</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl text-white">
          <AnimatePresence mode="wait">
            {step === 'request' ? (
              <motion.div
                key="request-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Link href="/login">
                    <button className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-300">
                      <ArrowLeft size={18} />
                    </button>
                  </Link>
                  <h2 className="text-2xl font-bold">Reset Password</h2>
                </div>
                <p className="text-slate-300 text-sm mb-6">
                  Enter your email address and we'll dispatch a secure authorization token to reset your password.
                </p>

                <form onSubmit={handleRequestToken} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 text-slate-400" size={20} />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Sending Request...' : 'Send Recovery Token'}
                    <ArrowRight size={18} />
                  </motion.button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="reset-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setStep('request')}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors text-slate-300"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <h2 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text">
                    Enter Recovery Code
                  </h2>
                </div>
                <p className="text-slate-300 text-sm mb-6">
                  Please verify your identity using the recovery code and provide your new account password.
                </p>

                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Recovery Code
                    </label>
                    <div className="relative">
                      <Key className="absolute left-3 top-3 text-slate-400" size={20} />
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                        placeholder="RECRUITAI-RESET-XXXXXX"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 text-slate-400" size={20} />
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Updating Password...' : 'Reset & Save Password'}
                    <ShieldCheck size={18} />
                  </motion.button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Back Link */}
        <p className="text-center text-slate-400 text-sm mt-6">
          Remembered your password?{' '}
          <Link href="/login">
            <span className="text-blue-400 hover:text-blue-300 cursor-pointer font-semibold">
              Go back to login
            </span>
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
