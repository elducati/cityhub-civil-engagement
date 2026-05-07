import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export async function getAllUsers() {
  const response = await api.get('/admin/users');
  return response.data;
}

export async function updateUserRole(userId: string, role: string) {
  const response = await api.put(`/admin/users/${userId}/role`, { role });
  return response.data;
}

export async function getAnalytics() {
  const response = await api.get('/admin/analytics');
  return response.data;
}

export default api;