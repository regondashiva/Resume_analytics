import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import { reportService, jobService } from '@/services/api';
import toast from 'react-hot-toast';
import { Download, FileText, BarChart3, FileSpreadsheet } from 'lucide-react';

export default function ReportsPage() {
  const [reportType, setReportType] = useState<'pdf' | 'excel'>('pdf');
  const [exportType, setExportType] = useState<'excel' | 'csv'>('excel');
  
  // Job Filtering States
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [loadingJobs, setLoadingJobs] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoadingJobs(true);
      const response = await jobService.getAllJobs();
      setJobs(response.jobs || []);
    } catch (error) {
      console.error('Failed to load target job listings:', error);
    } finally {
      setLoadingJobs(false);
    }
  };

  const handleGenerateReport = async () => {
    toast.loading('Generating recruitment report...', { id: 'report-loader' });
    try {
      const blob = await reportService.generateReport(selectedJobId, reportType);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExt = reportType === 'pdf' ? 'pdf' : 'xlsx';
      const jobSuffix = selectedJobId ? `job-${selectedJobId}` : 'general';
      link.download = `recruitment-report-${jobSuffix}.${fileExt}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Recruitment report downloaded successfully!', { id: 'report-loader' });
    } catch (error) {
      toast.error('Failed to generate recruitment report. Ensure matching results exist.', { id: 'report-loader' });
    }
  };

  const handleExportCandidates = async () => {
    toast.loading(`Exporting candidate directory as ${exportType.toUpperCase()}...`, { id: 'export-loader' });
    try {
      const blob = await reportService.exportCandidates(exportType);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const fileExt = exportType === 'excel' ? 'xlsx' : 'csv';
      link.download = `candidates-export.${fileExt}`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Candidates directory exported successfully!', { id: 'export-loader' });
    } catch (error) {
      toast.error('Failed to export candidates directory.', { id: 'export-loader' });
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <BarChart3 className="text-blue-600" size={32} />
            Reports & Export Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Generate analytical recruitment reports, filter matching summaries by job listing, or export structured candidate pools.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Generate Job Matchings Report */}
          <motion.div
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <BarChart3 className="text-blue-600" size={28} />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Recruitment Matching Report
                </h2>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Generate matching lists including ranking ranks, applicant names, skills similarity, and AI recommendation grades.
              </p>

              {/* Job Selector Dropdown */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Target Job Position Filter
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 dark:text-slate-100 font-bold"
                >
                  <option value="">-- General Report (All Jobs Summary) --</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.title} ({job.department || 'Engineering'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Format Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Report File Format
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setReportType('pdf')}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                      reportType === 'pdf'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-slate-55 dark:bg-slate-700/50 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-650'
                    }`}
                  >
                    Adobe PDF (.pdf)
                  </button>
                  <button
                    onClick={() => setReportType('excel')}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                      reportType === 'excel'
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : 'bg-slate-55 dark:bg-slate-700/50 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-650'
                    }`}
                  >
                    MS Excel (.xlsx)
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleGenerateReport}
              className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={18} />
              Generate & Download Report
            </motion.button>
          </motion.div>

          {/* Export Structured Candidates Directory */}
          <motion.div
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl flex flex-col justify-between"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="text-green-600" size={28} />
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Export Candidate Database
                </h2>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Export the global applicant repository including contact coordinates, extracted skill matrices, work tenures, and parsed histories.
              </p>

              <div className="p-4 bg-green-50 dark:bg-green-950/20 border border-green-150 dark:border-green-900/40 rounded-xl space-y-2">
                <p className="text-xs text-green-800 dark:text-green-300 leading-relaxed font-semibold">
                  ✓ Comprehensive profiles audit log
                  <br />✓ Formatted directly for automated ATS matching
                  <br />✓ Perfect for spreadsheet indexing
                </p>
              </div>

              {/* Export Format Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                  Export Format
                </label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setExportType('excel')}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                      exportType === 'excel'
                        ? 'bg-green-600 border-green-600 text-white shadow-md'
                        : 'bg-slate-55 dark:bg-slate-700/50 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-650'
                    }`}
                  >
                    MS Excel (.xlsx)
                  </button>
                  <button
                    onClick={() => setExportType('csv')}
                    className={`flex-1 px-4 py-2.5 rounded-xl font-bold text-xs transition-all border ${
                      exportType === 'csv'
                        ? 'bg-green-600 border-green-600 text-white shadow-md'
                        : 'bg-slate-55 dark:bg-slate-700/50 text-slate-700 dark:text-slate-350 border-slate-200 dark:border-slate-650'
                    }`}
                  >
                    Comma-Separated (.csv)
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleExportCandidates}
              className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Download size={18} />
              Export Candidate Database
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
