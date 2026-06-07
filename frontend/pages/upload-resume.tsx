import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '@/layouts/DashboardLayout';
import FileUpload from '@/components/FileUpload';
import toast from 'react-hot-toast';
import { resumeService } from '@/services/api';
import { CheckCircle, AlertCircle, FileSpreadsheet, FileDown } from 'lucide-react';

export default function UploadResumePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const handleDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setFiles(acceptedFiles);
    setUploading(true);
    setProgress(15);

    // Simulate animated incremental progress loading states
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 250);

    try {
      const results: any[] = [];
      
      // Upload files sequentially to accurately handle duplicate errors for each file
      for (const file of acceptedFiles) {
        try {
          const res = await resumeService.uploadResume(file);
          results.push(res);
        } catch (error: any) {
          const errDetail = error.response?.data?.detail || `Failed to upload "${file.name}"`;
          toast.error(errDetail, {
            duration: 6000,
            icon: '⚠️'
          });
        }
      }

      setProgress(100);
      clearInterval(progressInterval);

      if (results.length > 0) {
        setUploadedFiles((prev) => [...results, ...prev]);
        toast.success(`Successfully uploaded and parsed ${results.length} candidate(s)!`);
      }
      setFiles([]);
    } catch (globalError) {
      clearInterval(progressInterval);
      toast.error('An error occurred during resume uploads.');
    } finally {
      setTimeout(() => {
        setUploading(false);
        setProgress(0);
      }, 500);
    }
  }, []);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <CheckCircle className="text-blue-600" size={32} />
            Resume Upload Center
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            Drag and drop candidate resumes (PDF/DOCX) for instantaneous AI parsing, duplicate check, and grading.
          </p>
        </div>

        {/* Upload Box Card */}
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-xl space-y-6">
          <FileUpload
            onDrop={handleDrop}
            label={
              uploading ? 'Parsing & Scoring Resumes...' : 'Drag resumes here or click to browse'
            }
          />

          {/* Progress Indicator */}
          {uploading && (
            <div className="space-y-2 max-w-xl mx-auto">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-500 dark:text-slate-400">
                <span>Uploading {files.length} resume(s)...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden border dark:border-slate-600">
                <motion.div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.2 }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Uploaded Candidates Directory */}
        <AnimatePresence>
          {uploadedFiles.length > 0 && (
            <motion.div 
              className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-xl space-y-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="text-emerald-500" size={22} />
                Recently Processed Candidates
              </h2>

              <div className="space-y-4">
                {uploadedFiles.map((candidate, idx) => (
                  <motion.div
                    key={candidate.id || idx}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-100 dark:border-slate-750 hover:border-blue-300 dark:hover:border-blue-900/50 transition-colors"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-950/40 rounded-lg text-blue-600 dark:text-blue-400">
                        <FileDown size={20} />
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">
                          {candidate.name}
                        </p>
                        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                          {candidate.email || 'No contact email extracted'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right">
                        <p className="text-2xs font-extrabold uppercase text-slate-400 dark:text-slate-500 tracking-wider">
                          Primary Experience
                        </p>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {candidate.experience || 0.0} Years
                        </p>
                      </div>

                      <div className="px-3.5 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 rounded-lg text-xs font-extrabold">
                        Match Score: {candidate.score}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
}
