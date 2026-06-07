import React from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onDrop: (files: File[]) => void;
  accept?: string;
  maxSize?: number;
  label?: string;
}

export default function FileUpload({
  onDrop,
  accept = '.pdf,.docx',
  maxSize = 10 * 1024 * 1024,
  label = 'Upload Files',
}: FileUploadProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'] },
    maxSize,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
        isDragActive
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-slate-300 dark:border-slate-600 hover:border-blue-400'
      }`}
    >
      <input {...getInputProps()} />
      <motion.div
        animate={isDragActive ? { scale: 1.1 } : { scale: 1 }}
      >
        <Upload className="mx-auto h-12 w-12 text-blue-500 mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {label}
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
          Drag and drop your files here, or click to select
        </p>
        <p className="text-xs text-slate-500 mt-2">
          Supported formats: PDF, DOCX (Max 10MB)
        </p>
      </motion.div>
    </div>
  );
}
