import apiClient from './apiClient';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  signup: async (name: string, email: string, password: string, role: string = 'hr') => {
    const response = await apiClient.post('/auth/signup', { name, email, password, role });
    return response.data;
  },

  logout: async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const resumeService = {
  uploadResume: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/resume/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  parseResume: async (resumeId: string) => {
    const response = await apiClient.post(`/resume/${resumeId}/parse`);
    return response.data;
  },

  getAllCandidates: async (page: number = 1, limit: number = 10) => {
    const response = await apiClient.get(`/resume/candidates?page=${page}&limit=${limit}`);
    return response.data;
  },

  getCandidateDetails: async (candidateId: string) => {
    const response = await apiClient.get(`/resume/candidate/${candidateId}`);
    return response.data;
  },
};

export const jobService = {
  uploadJobDescription: async (title: string, description: string, requiredSkills: string[]) => {
    const response = await apiClient.post('/job/create', {
      title,
      description,
      required_skills: requiredSkills,
    });
    return response.data;
  },

  getAllJobs: async () => {
    const response = await apiClient.get('/job/all');
    return response.data;
  },

  getJobDetails: async (jobId: string) => {
    const response = await apiClient.get(`/job/${jobId}`);
    return response.data;
  },
};

export const matchingService = {
  matchCandidates: async (jobId: string) => {
    const response = await apiClient.post(`/matching/match/${jobId}`);
    return response.data;
  },

  getMatchResults: async (jobId: string) => {
    const response = await apiClient.get(`/matching/results/${jobId}`);
    return response.data;
  },

  getCandidateJobMatch: async (candidateId: string, jobId: string) => {
    const response = await apiClient.get(`/matching/candidate/${candidateId}/job/${jobId}`);
    return response.data;
  },
};

export const analyticsService = {
  getDashboardStats: async () => {
    const response = await apiClient.get('/analytics/dashboard');
    return response.data;
  },

  getSkillsAnalytics: async () => {
    const response = await apiClient.get('/analytics/skills');
    return response.data;
  },

  getRecruitmentTrends: async () => {
    const response = await apiClient.get('/analytics/trends');
    return response.data;
  },

  getCandidateFunnel: async (jobId: string) => {
    const response = await apiClient.get(`/analytics/funnel/${jobId}`);
    return response.data;
  },

  getGlobalCandidateFunnel: async () => {
    const response = await apiClient.get('/analytics/funnel');
    return response.data;
  },

  getExperienceAnalytics: async () => {
    const response = await apiClient.get('/analytics/experience');
    return response.data;
  },
};

export const reportService = {
  generateReport: async (jobId: string, format: 'pdf' | 'excel' = 'pdf') => {
    const response = await apiClient.post(`/report/generate`, {
      job_id: jobId,
      format,
    }, {
      responseType: format === 'pdf' ? 'blob' : 'blob',
    });
    return response.data;
  },

  exportCandidates: async (format: 'excel' | 'csv' = 'excel') => {
    const response = await apiClient.post(`/report/export-candidates`, {
      format,
    }, {
      responseType: 'blob',
    });
    return response.data;
  },
};

export const aiService = {
  chat: async (query: string) => {
    const response = await apiClient.post('/matching/chatbot', { query });
    return response.data;
  },
};

