import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import { aiService } from '@/services/api';
import toast from 'react-hot-toast';
import {
  Send,
  MessageSquare,
  Sparkles,
  User,
  Bot,
  Zap,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  candidates?: any[];
  timestamp: Date;
}

const STARTER_PROMPTS = [
  'Who is our top candidate for a Python developer role?',
  'Which candidates have AWS cloud or DevOps skills?',
  'Who has the highest overall match score and at least 3 years experience?',
  'Show me candidates with React and SQL background.',
];

export default function AIChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Hello! I am your AI Recruitment Assistant. I can analyze candidate skills, experience, and scores to help you find the best talent. What role or skill set are you looking for today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiService.chat(textToSend);
      
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: response.response,
        candidates: response.candidates || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (error) {
      toast.error('Failed to get a response from the AI assistant.');
      
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: "I'm sorry, I encountered an error while processing your request. Please check your database connection and try again.",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-[calc(100vh-140px)] max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex justify-between items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-md">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-xl text-white shadow-lg">
              <Sparkles size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                AI Recruiter Assistant
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs">
                Ask natural questions to query and rank resumes in your database.
              </p>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden flex flex-col">
          {/* Messages List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/50 dark:bg-slate-900/20">
            <AnimatePresence initial={false}>
              {messages.map((msg) => {
                const isAI = msg.sender === 'ai';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-4 ${isAI ? 'justify-start' : 'justify-end'}`}
                  >
                    {isAI && (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                        <Bot size={20} />
                      </div>
                    )}

                    <div className="max-w-[75%] space-y-4">
                      {/* Text Bubble */}
                      <div
                        className={`rounded-2xl p-4 text-sm leading-relaxed shadow-sm whitespace-pre-line ${
                          isAI
                            ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-650'
                            : 'bg-blue-600 text-white font-medium'
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Candidates Cards if returned */}
                      {isAI && msg.candidates && msg.candidates.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                          {msg.candidates.map((cand) => (
                            <motion.div
                              key={cand.id}
                              className="bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                              whileHover={{ y: -2 }}
                            >
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                                    {cand.name}
                                  </h4>
                                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded text-xs font-bold">
                                    {cand.score}% Match
                                  </span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                                  {cand.email}
                                </p>
                                <p className="text-slate-600 dark:text-slate-300 text-xs mt-2">
                                  💼 {cand.experience_years} years experience
                                </p>
                              </div>

                              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-600 flex justify-end">
                                <Link href={`/candidates/${cand.id}`}>
                                  <button className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                    View Full Profile
                                    <ExternalLink size={12} />
                                  </button>
                                </Link>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isAI && (
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0 shadow-md">
                        <User size={20} />
                      </div>
                    )}
                  </motion.div>
                );
              })}

              {/* Typing Loader */}
              {loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-4 justify-start"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white shrink-0 shadow-md">
                    <Bot size={20} />
                  </div>
                  <div className="bg-white dark:bg-slate-700 rounded-2xl p-4 border border-slate-100 dark:border-slate-650 flex gap-1.5 items-center">
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Starters */}
          {messages.length === 1 && (
            <div className="p-6 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-700/60">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3 flex items-center gap-1">
                <Zap size={14} className="text-yellow-500" />
                Quick Starter Prompts:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-left text-xs p-3 bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50/30 transition-all text-slate-700 dark:text-slate-300 flex justify-between items-center gap-2"
                  >
                    <span>{prompt}</span>
                    <ArrowRight size={12} className="shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend(input);
            }}
            className="p-4 border-t border-slate-200 dark:border-slate-700 flex gap-3 bg-white dark:bg-slate-800"
          >
            <input
              type="text"
              placeholder="Ask anything (e.g. 'Show me candidates with 5+ years experience in Python')"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all rounded-xl text-white disabled:opacity-50 shrink-0"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
