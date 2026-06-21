import api from './axiosInstance';

export const getWarehouses = () => api.get('/warehouses');
export const getWarehouseById = (id) => api.get(`/warehouses/${id}`);
export const getWarehouseStock = (id) => api.get(`/warehouses/${id}/stock`);
export const createWarehouse = (data) => api.post('/warehouses', data);
