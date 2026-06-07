import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import { jobService, matchingService, reportService } from '@/services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Award,
  Zap,
  CheckCircle,
  XCircle,
  Download,
  Play,
  User,
  Users,
  Search,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function JobMatchingPage() {
  const router = useRouter();
  const { id } = router.query;

  const [job, setJob] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (id) {
      fetchJobDetailsAndMatches();
    }
  }, [id]);

  const fetchJobDetailsAndMatches = async () => {
    try {
      setLoading(true);
      const jobData = await jobService.getJobDetails(id as string);
      setJob(jobData);

      const matchData = await matchingService.getMatchResults(id as string);
      setMatches(matchData.matches || []);
    } catch (error) {
      toast.error('Failed to load job matching details');
    } finally {
      setLoading(false);
    }
  };

  const handleRunMatching = async () => {
    try {
      setMatching(true);
      toast.loading('AI Engines matching candidates...', { id: 'matching' });
      await matchingService.matchCandidates(id as string);
      toast.success('AI Matching completed successfully!', { id: 'matching' });
      
      // Reload matches
      const matchData = await matchingService.getMatchResults(id as string);
      setMatches(matchData.matches || []);
    } catch (error) {
      toast.error('Error running AI matching engine', { id: 'matching' });
    } finally {
      setMatching(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.loading('Generating PDF report...', { id: 'pdf' });
      const blob = await reportService.generateReport(id as string, 'pdf');
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `${job?.title.replace(/\s+/g, '-').toLowerCase()}-recruitment-report.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('PDF report downloaded!', { id: 'pdf' });
    } catch (error) {
      toast.error('Failed to generate PDF report', { id: 'pdf' });
    }
  };

  const filteredMatches = matches.filter((match) =>
    match.candidate_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topMatchesData = matches.slice(0, 5).map((m) => ({
    name: m.candidate_name,
    score: parseFloat(m.match_score.toFixed(1)),
  }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        {/* Back navigation */}
        <Link href="/job-descriptions">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-all font-medium">
            <ArrowLeft size={18} />
            Back to Job Descriptions
          </button>
        </Link>

        {/* Job Details Card */}
        {job && (
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-slate-700 rounded-2xl p-8 shadow-2xl text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold uppercase tracking-wider">
                  Active Job Posting
                </span>
                <h1 className="text-3xl font-extrabold mt-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {job.title}
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                  Created on {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleRunMatching}
                  disabled={matching}
                  className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg transition-all rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  <Play size={16} className={matching ? 'animate-pulse' : ''} />
                  {matching ? 'Matching...' : 'Run Matching Engine'}
                </button>

                {matches.length > 0 && (
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-2 px-5 py-3 bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 rounded-xl text-sm font-semibold text-slate-200"
                  >
                    <Download size={16} />
                    Download PDF Report
                  </button>
                )}
              </div>
            </div>

            <div className="mt-8 border-t border-slate-800 pt-6">
              <h3 className="font-semibold text-slate-200 mb-2">Job Description</h3>
              <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
                {job.description}
              </p>
            </div>

            {job.required_skills && job.required_skills.length > 0 && (
              <div className="mt-6">
                <h3 className="font-semibold text-slate-200 mb-3">Required Skill Profile</h3>
                <div className="flex flex-wrap gap-2">
                  {job.required_skills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-slate-800 border border-slate-700 text-blue-300 rounded-lg text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Analysis and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Panel */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Zap size={22} className="text-purple-500 animate-pulse" />
                AI Match Distribution
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                Visualizing top candidate scores matching this job description.
              </p>
            </div>

            {topMatchesData.length > 0 ? (
              <div className="mt-6 flex-1 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topMatchesData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" domain={[0, 100]} stroke="#94a3b8" />
                    <YAxis dataKey="name" type="category" width={80} stroke="#94a3b8" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e293b',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#fff',
                      }}
                    />
                    <Bar dataKey="score" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
                <Users size={36} className="mb-2 text-slate-300" />
                No distribution data available.
              </div>
            )}
          </div>

          {/* Matches List / Table Panel */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Ranked Match Results
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">
                  AI-ranked candidates based on skills, experience, and similarity.
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input
                  type="text"
                  placeholder="Search matched candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              {filteredMatches.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-700/30 text-slate-500 dark:text-slate-400 text-xs font-semibold border-b border-slate-200 dark:border-slate-700">
                      <th className="px-6 py-4 text-left">Rank</th>
                      <th className="px-6 py-4 text-left">Candidate</th>
                      <th className="px-6 py-4 text-center">Score</th>
                      <th className="px-6 py-4 text-center">Experience Match</th>
                      <th className="px-6 py-4 text-center">Recommendation</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700 text-sm">
                    {filteredMatches.map((match, idx) => {
                      const isHigh = match.recommendation === 'high';
                      const isMedium = match.recommendation === 'medium';
                      
                      return (
                        <tr
                          key={match.id}
                          className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-all border-b border-slate-100 dark:border-slate-700"
                        >
                          <td className="px-6 py-4 font-semibold text-slate-800 dark:text-slate-200">
                            {idx === 0 ? (
                              <span className="text-xl">🏆</span>
                            ) : idx === 1 ? (
                              <span className="text-xl">🥈</span>
                            ) : idx === 2 ? (
                              <span className="text-xl">🥉</span>
                            ) : (
                              `#${idx + 1}`
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-semibold text-slate-900 dark:text-white">
                              {match.candidate_name}
                            </div>
                            <div className="text-slate-500 dark:text-slate-400 text-xs">
                              {match.candidate_email}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className="inline-block px-3 py-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold text-xs shadow-md">
                              {match.match_score.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center text-slate-700 dark:text-slate-300">
                            {match.experience_match.toFixed(0)}%
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                isHigh
                                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  : isMedium
                                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                                  : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              }`}
                            >
                              {match.recommendation.toUpperCase()}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link href={`/candidates/${match.candidate_id}`}>
                              <button className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                                View Profile
                                <ExternalLink size={12} />
                              </button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/10">
                  <Users className="mx-auto text-slate-300 dark:text-slate-600 mb-4" size={48} />
                  <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">
                    No Match Analytics Yet
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mx-auto mb-6">
                    Run the matching engine using the button above to perform AI candidates matching.
                  </p>
                  <button
                    onClick={handleRunMatching}
                    disabled={matching}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-md transition-all disabled:opacity-50"
                  >
                    <Play size={14} />
                    Start Matching Engine
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
