import api from './axiosInstance';

export const addStock = (data) => api.post('/stock/add', data);
export const removeStock = (data) => api.post('/stock/remove', data);
export const transferStock = (data) => api.post('/stock/transfer', data);
