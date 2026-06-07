import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import { resumeService, jobService } from '@/services/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  Mail,
  Phone,
  Briefcase,
  Award,
  BookOpen,
  Zap,
  ArrowLeft,
  Sliders,
} from 'lucide-react';
import Link from 'next/link';
import apiClient from '@/services/apiClient';

export default function CandidateDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Target Job Skill Gap States
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [gapReport, setGapReport] = useState<any>(null);
  const [fetchingGap, setFetchingGap] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCandidateDetails();
      fetchJobs();
    }
  }, [id]);

  const fetchCandidateDetails = async () => {
    try {
      setLoading(true);
      const response = await resumeService.getCandidateDetails(id as string);
      setCandidate(response);
    } catch (error) {
      toast.error('Failed to load candidate details');
      router.push('/candidates');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const response = await jobService.getAllJobs();
      setJobs(response.jobs || []);
    } catch (error) {
      console.error('Failed to load job listings', error);
    }
  };

  const fetchSkillGap = async (jobId: string) => {
    try {
      setFetchingGap(true);
      const res = await apiClient.get(`/matching/skill-gap/candidate/${id}/job/${jobId}`);
      setGapReport(res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to analyze skills gaps.');
    } finally {
      setFetchingGap(false);
    }
  };

  if (loading || !candidate) {
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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Back Button */}
        <Link href="/candidates">
          <button className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-semibold">
            <ArrowLeft size={20} />
            Back to Candidates
          </button>
        </Link>

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8 shadow-lg">
          <h1 className="text-3xl font-bold">{candidate.name}</h1>
          <p className="text-blue-100 mt-2">Candidate Profile</p>

          {/* Contact Info */}
          <div className="flex flex-col md:flex-row gap-6 mt-6">
            <a href={`mailto:${candidate.email}`} className="flex items-center gap-2 font-medium hover:underline">
              <Mail size={20} />
              {candidate.email}
            </a>
            {candidate.phone && (
              <a href={`tel:${candidate.phone}`} className="flex items-center gap-2 font-medium hover:underline">
                <Phone size={20} />
                {candidate.phone}
              </a>
            )}
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium">Resume Score</p>
            <div className="flex items-center justify-between">
              <h3 className="text-3xl font-bold text-blue-600">
                {(candidate.score || 0).toFixed(1)}/100
              </h3>
              <Zap className="text-yellow-500 animate-pulse" size={32} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium font-medium">
              Experience
            </p>
            <h3 className="text-3xl font-bold text-purple-600">
              {candidate.experience_years || 0} Years
            </h3>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-2 font-medium font-medium font-medium">
              Skills Extracted
            </p>
            <h3 className="text-3xl font-bold text-green-600">
              {(candidate.skills || []).length}
            </h3>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Skills */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b pb-3 dark:border-slate-700">
              <Award size={24} className="text-blue-600" />
              Technical Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {(candidate.skills || []).map((skill: string, idx: number) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-bold"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b pb-3 dark:border-slate-700">
              <BookOpen size={24} className="text-purple-600" />
              Education History
            </h2>
            <div className="space-y-3">
              {candidate.education && typeof candidate.education === 'string' ? (
                <p className="text-slate-700 dark:text-slate-350 text-sm leading-relaxed font-semibold">{candidate.education}</p>
              ) : (
                <p className="text-slate-500 dark:text-slate-400 text-xs font-semibold">No education history extracted</p>
              )}
            </div>
          </div>

          {/* Experience */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b pb-3 dark:border-slate-700">
              <Briefcase size={24} className="text-green-600" />
              Work Experience Description
            </h2>
            <p className="text-slate-700 dark:text-slate-300 text-xs font-semibold leading-relaxed whitespace-pre-line">
              {candidate.experience_details || 'No Chronological experience details parsed.'}
            </p>
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* Resume Improvement Suggestions */}
          {candidate.ai_suggestions && candidate.ai_suggestions.length > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-850 dark:to-slate-800 border border-blue-100 dark:border-slate-750 rounded-2xl p-6 shadow-lg">
              <h3 className="font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Zap className="text-yellow-500 animate-bounce" size={20} />
                AI Resume Optimization Suggestions
              </h3>
              <ul className="space-y-3">
                {candidate.ai_suggestions.map((suggestion: string, idx: number) => (
                  <li key={idx} className="flex gap-2 text-xs text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    <span className="text-blue-500 font-bold">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Fake Resume Detection */}
          {candidate.ai_fake_analysis && (
            <div className={`border rounded-2xl p-6 shadow-lg ${
              candidate.ai_fake_analysis.is_suspicious
                ? 'bg-red-50/50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                : 'bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50'
            }`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Award size={20} className={candidate.ai_fake_analysis.is_suspicious ? 'text-red-500' : 'text-green-500'} />
                  AI Veracity & Authenticity Detection
                </h3>
                <span className={`px-3 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wide border ${
                  candidate.ai_fake_analysis.is_suspicious
                    ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300 border-red-200 dark:border-red-900/55'
                    : 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300 border-green-200 dark:border-green-900/55'
                }`}>
                  {candidate.ai_fake_analysis.status}
                </span>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 mb-1 uppercase tracking-wider">
                  Anomalies Risk Score:
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        candidate.ai_fake_analysis.is_suspicious ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${candidate.ai_fake_analysis.risk_score}%` }}
                    />
                  </div>
                  <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                    {candidate.ai_fake_analysis.risk_score}%
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Analysis Details:
                </p>
                {candidate.ai_fake_analysis.reasons.map((reason: string, idx: number) => (
                  <p key={idx} className="text-xs text-slate-650 dark:text-slate-400 font-semibold leading-relaxed">
                    - {reason}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Skill Gap Intelligence Panel */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-lg mt-8 space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b pb-6 dark:border-slate-700">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sliders size={24} className="text-blue-600" />
                Skill Gap Intelligence & upskilling Roadmap
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Select a target job description to evaluate matching capabilities and view training roadmaps.
              </p>
            </div>
            
            <div className="w-full md:w-72">
              <select
                value={selectedJobId}
                onChange={(e) => {
                  setSelectedJobId(e.target.value);
                  if (e.target.value) {
                    fetchSkillGap(e.target.value);
                  } else {
                    setGapReport(null);
                  }
                }}
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-bold"
              >
                <option value="">-- Select Target Job Description --</option>
                {jobs.map((job: any) => (
                  <option key={job.id} value={job.id}>
                    {job.title} ({job.department || 'Engineering'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {fetchingGap ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : gapReport ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Header Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-150 dark:border-emerald-900/40 rounded-xl text-center">
                  <p className="text-[10px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">
                    Skills Match Rating
                  </p>
                  <h4 className="text-3xl font-extrabold text-emerald-700 dark:text-emerald-300 mt-1">
                    {gapReport.skills_match_score}%
                  </h4>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-150 dark:border-blue-900/40 rounded-xl text-center">
                  <p className="text-[10px] font-extrabold uppercase text-blue-600 dark:text-blue-400 tracking-wider">
                    Estimated Training Duration
                  </p>
                  <h4 className="text-3xl font-extrabold text-blue-700 dark:text-blue-300 mt-1">
                    {gapReport.estimated_completion_time_days} Days
                  </h4>
                </div>

                <div className="p-4 bg-purple-50 dark:bg-purple-950/20 border border-purple-150 dark:border-purple-900/40 rounded-xl text-center flex flex-col justify-center items-center">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                  >
                    <BookOpen size={14} />
                    Print / Export Report
                  </button>
                </div>
              </div>

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 border border-slate-100 dark:border-slate-750 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/20">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    Matched Capabilities ({gapReport.matched_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gapReport.matched_skills.length > 0 ? (
                      gapReport.matched_skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-400 rounded-md text-xs font-bold border border-emerald-150 dark:border-emerald-900/30">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">None of the required skills were detected.</span>
                    )}
                  </div>
                </div>

                <div className="p-5 border border-slate-100 dark:border-slate-750 rounded-xl space-y-3 bg-slate-50/50 dark:bg-slate-900/20">
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-2 uppercase tracking-wide">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Identified Skills Gaps ({gapReport.missing_skills.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {gapReport.missing_skills.length > 0 ? (
                      gapReport.missing_skills.map((skill: string, idx: number) => (
                        <span key={idx} className="px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 rounded-md text-xs font-bold border border-amber-150 dark:border-amber-900/30">
                          {skill}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 font-semibold">No missing skills detected! Perfect match!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Roadmap Timeline */}
              {gapReport.roadmap.length > 0 ? (
                <div className="space-y-4 pt-4">
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                    <Zap size={16} className="text-yellow-500 animate-pulse" />
                    Step-by-Step Training & upskilling Roadmap
                  </h4>

                  <div className="relative pl-6 border-l border-slate-200 dark:border-slate-700 space-y-6">
                    {gapReport.roadmap.map((step: any, idx: number) => (
                      <div key={idx} className="relative group">
                        {/* Circular timeline dot with step number */}
                        <span className="absolute -left-[38px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white font-black text-2xs shadow border-2 border-white dark:border-slate-800">
                          {step.step}
                        </span>

                        <div className="p-4 border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-900/40 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-2">
                            <span className="font-bold text-sm text-slate-900 dark:text-white">
                              Focus Area: {step.skill}
                            </span>
                            <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded text-[10px] font-extrabold tracking-wider uppercase border border-blue-150 dark:border-blue-900/30">
                              {step.level}
                            </span>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 text-xs">
                            <div className="text-slate-600 dark:text-slate-400 font-semibold">
                              Course Suggestion: <span className="font-extrabold text-slate-800 dark:text-slate-250 underline cursor-pointer">{step.course}</span>
                            </div>
                            <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-850 px-2 py-1 rounded">
                              ⏳ {step.duration_days} Days
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-350 border border-emerald-250 dark:border-emerald-900/40 rounded-xl text-center font-bold text-sm">
                  🎉 Congratulations! The candidate fulfills all required skills for this job listing. No upskilling roadmap required!
                </div>
              )}
            </motion.div>
          ) : (
            <div className="text-center py-12 text-slate-400 dark:text-slate-500 font-semibold border-2 border-dashed border-slate-150 dark:border-slate-750 rounded-2xl">
              Select a target job from the dropdown above to auto-generate a comprehensive educational upskilling roadmap.
            </div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
