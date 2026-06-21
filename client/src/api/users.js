import api from './axiosInstance';

export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const patchUser = (id, data) => api.patch(`/users/${id}/role`, data);
