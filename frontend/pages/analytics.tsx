import React from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import {
  SkillsBarChart,
  RecruitmentTrendsChart,
  ExperienceDistributionChart,
  CandidateFunnelChart,
} from '@/charts/Charts';
import { analyticsService } from '@/services/api';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [chartData, setChartData] = React.useState<any>({
    skills: [],
    trends: [],
    experience: [],
    funnel: [],
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const [skills, trends, experience, funnel] = await Promise.all([
          analyticsService.getSkillsAnalytics(),
          analyticsService.getRecruitmentTrends(),
          analyticsService.getExperienceAnalytics(),
          analyticsService.getGlobalCandidateFunnel(),
        ]);

        setChartData({
          skills: skills.data || [],
          trends: trends.data || [],
          experience: experience.data || [],
          funnel: funnel.data || [],
        });
      } catch (error) {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Detailed recruitment insights and metrics
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkillsBarChart data={chartData.skills} title="Top Required Skills" />
          <CandidateFunnelChart data={chartData.funnel} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <RecruitmentTrendsChart data={chartData.trends} />
          <ExperienceDistributionChart data={chartData.experience} />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
