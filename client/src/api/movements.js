import api from './axiosInstance';

export const getMovements = (params) => api.get('/movements', { params });
export const getDashboardStats = () => api.get('/movements/dashboard');
export const getAudit = (params) => api.get('/movements/audit', { params });
