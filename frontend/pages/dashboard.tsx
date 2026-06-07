import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import KPICard from '@/components/KPICard';
import {
  SkillsBarChart,
  CandidateFunnelChart,
  RecruitmentTrendsChart,
  ExperienceDistributionChart,
} from '@/charts/Charts';
import {
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  XCircle,
  Award,
} from 'lucide-react';
import { analyticsService } from '@/services/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<any>({
    skills: [],
    trends: [],
    experience: [],
    funnel: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dashboardData, skillsData, trendsData, experienceData] = await Promise.all([
          analyticsService.getDashboardStats(),
          analyticsService.getSkillsAnalytics(),
          analyticsService.getRecruitmentTrends(),
          analyticsService.getExperienceAnalytics(),
        ]);

        setStats(dashboardData);
        setChartData({
          skills: skillsData.data || [],
          trends: trendsData.data || [],
          experience: experienceData.data || [],
          funnel: [
            { name: 'Applied', value: dashboardData.total_candidates || 0 },
            { name: 'Reviewed', value: Math.floor((dashboardData.total_candidates || 0) * 0.7) },
            { name: 'Shortlisted', value: Math.floor((dashboardData.total_candidates || 0) * 0.4) },
            { name: 'Selected', value: dashboardData.selected_candidates || 0 },
          ],
        });
      } catch (error) {
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Recruitment Analytics
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Monitor your hiring metrics and candidate insights
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <KPICard
            title="Total Candidates"
            value={stats?.total_candidates || 0}
            icon={<Users size={24} />}
            trend={12}
            color="blue"
          />
          <KPICard
            title="Open Jobs"
            value={stats?.total_jobs || 0}
            icon={<Briefcase size={24} />}
            trend={5}
            color="purple"
          />
          <KPICard
            title="Selected"
            value={stats?.selected_candidates || 0}
            icon={<CheckCircle size={24} />}
            trend={8}
            color="green"
          />
          <KPICard
            title="Rejected"
            value={stats?.rejected_candidates || 0}
            icon={<XCircle size={24} />}
            trend={-3}
            color="pink"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SkillsBarChart
            data={chartData.skills}
            title="Top Required Skills"
          />
          <CandidateFunnelChart data={chartData.funnel} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecruitmentTrendsChart data={chartData.trends} />
          <ExperienceDistributionChart data={chartData.experience} />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
