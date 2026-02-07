import axios from 'axios';

const API_BASE = `${process.env.REACT_APP_BACKEND_URL}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  // Auth
  register: (data) => axios.post(`${API_BASE}/auth/register`, data),
  login: (data) => axios.post(`${API_BASE}/auth/login`, data),
  getMe: () => axios.get(`${API_BASE}/auth/me`, { headers: getAuthHeader() }),

  // Dashboard
  getDashboard: () => axios.get(`${API_BASE}/dashboard`, { headers: getAuthHeader() }),

  // Tasks
  getTasks: () => axios.get(`${API_BASE}/tasks`, { headers: getAuthHeader() }),
  submitTask: (taskId, formData) => axios.post(`${API_BASE}/tasks/${taskId}/submit`, formData, {
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
  }),
  getMySubmissions: () => axios.get(`${API_BASE}/tasks/submissions`, { headers: getAuthHeader() }),

  // Ads
  getAds: () => axios.get(`${API_BASE}/ads`, { headers: getAuthHeader() }),
  watchAd: (adId) => axios.post(`${API_BASE}/ads/${adId}/watch`, {}, { headers: getAuthHeader() }),

  // Wallet
  getWallet: () => axios.get(`${API_BASE}/wallet`, { headers: getAuthHeader() }),
  createWithdrawal: (data) => axios.post(`${API_BASE}/wallet/withdraw`, data, { headers: getAuthHeader() }),

  // KYC
  submitKYC: (formData) => axios.post(`${API_BASE}/kyc`, formData, {
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
  }),
  getKYCStatus: () => axios.get(`${API_BASE}/kyc`, { headers: getAuthHeader() }),

  // Uploads
  submitUpload: (formData) => axios.post(`${API_BASE}/uploads`, formData, {
    headers: { ...getAuthHeader(), 'Content-Type': 'multipart/form-data' }
  }),
  getMyUploads: () => axios.get(`${API_BASE}/uploads`, { headers: getAuthHeader() }),

  // Referrals
  getReferrals: () => axios.get(`${API_BASE}/referrals`, { headers: getAuthHeader() }),

  // Profile
  getProfile: () => axios.get(`${API_BASE}/profile`, { headers: getAuthHeader() }),
  updateProfile: (data) => axios.put(`${API_BASE}/profile`, data, { headers: getAuthHeader() }),
  deleteAccount: () => axios.delete(`${API_BASE}/profile/delete-account`, { headers: getAuthHeader() }),

  // Admin Auth
  adminLogin: (data) => axios.post(`${API_BASE}/admin/login`, data),

  // Admin APIs
  admin: {
    getDashboard: () => axios.get(`${API_BASE}/admin/dashboard`, { headers: getAuthHeader() }),
    getUsers: () => axios.get(`${API_BASE}/admin/users`, { headers: getAuthHeader() }),
    blockUser: (userId) => axios.put(`${API_BASE}/admin/users/${userId}/block`, {}, { headers: getAuthHeader() }),
    
    getTasks: () => axios.get(`${API_BASE}/admin/tasks`, { headers: getAuthHeader() }),
    createTask: (data) => axios.post(`${API_BASE}/admin/tasks`, data, { headers: getAuthHeader() }),
    updateTask: (id, data) => axios.put(`${API_BASE}/admin/tasks/${id}`, data, { headers: getAuthHeader() }),
    deleteTask: (id) => axios.delete(`${API_BASE}/admin/tasks/${id}`, { headers: getAuthHeader() }),
    getSubmissions: () => axios.get(`${API_BASE}/admin/tasks/submissions`, { headers: getAuthHeader() }),
    approveSubmission: (id) => axios.put(`${API_BASE}/admin/tasks/submissions/${id}/approve`, {}, { headers: getAuthHeader() }),
    rejectSubmission: (id, reason) => axios.put(`${API_BASE}/admin/tasks/submissions/${id}/reject`, { reason }, { headers: getAuthHeader() }),
    
    getAds: () => axios.get(`${API_BASE}/admin/ads`, { headers: getAuthHeader() }),
    createAd: (data) => axios.post(`${API_BASE}/admin/ads`, data, { headers: getAuthHeader() }),
    updateAd: (id, data) => axios.put(`${API_BASE}/admin/ads/${id}`, data, { headers: getAuthHeader() }),
    deleteAd: (id) => axios.delete(`${API_BASE}/admin/ads/${id}`, { headers: getAuthHeader() }),
    
    getWithdrawals: () => axios.get(`${API_BASE}/admin/withdrawals`, { headers: getAuthHeader() }),
    approveWithdrawal: (id) => axios.put(`${API_BASE}/admin/withdrawals/${id}/approve`, {}, { headers: getAuthHeader() }),
    rejectWithdrawal: (id, reason) => axios.put(`${API_BASE}/admin/withdrawals/${id}/reject`, { reason }, { headers: getAuthHeader() }),
    
    getKYC: () => axios.get(`${API_BASE}/admin/kyc`, { headers: getAuthHeader() }),
    approveKYC: (userId) => axios.put(`${API_BASE}/admin/kyc/${userId}/approve`, {}, { headers: getAuthHeader() }),
    rejectKYC: (userId, reason) => axios.put(`${API_BASE}/admin/kyc/${userId}/reject`, { reason }, { headers: getAuthHeader() }),
    
    getUploads: () => axios.get(`${API_BASE}/admin/uploads`, { headers: getAuthHeader() }),
    approveUpload: (id) => axios.put(`${API_BASE}/admin/uploads/${id}/approve`, {}, { headers: getAuthHeader() }),
    rejectUpload: (id, reason) => axios.put(`${API_BASE}/admin/uploads/${id}/reject`, { reason }, { headers: getAuthHeader() }),
    
    getSettings: () => axios.get(`${API_BASE}/admin/settings`, { headers: getAuthHeader() }),
    updateSettings: (data) => axios.put(`${API_BASE}/admin/settings`, data, { headers: getAuthHeader() }),
    
    getCMSPages: () => axios.get(`${API_BASE}/admin/cms`, { headers: getAuthHeader() }),
    updateCMSPage: (pageId, data) => axios.put(`${API_BASE}/admin/cms/${pageId}`, data, { headers: getAuthHeader() })
  }
};