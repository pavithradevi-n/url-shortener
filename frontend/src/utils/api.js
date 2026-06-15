import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Add token to every request automatically
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth routes
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);

// URL routes
export const createShortUrl = (data) => API.post('/urls/shorten', data);
export const getAllUrls = () => API.get('/urls');
export const deleteUrl = (id) => API.delete(`/urls/${id}`);
export const updateUrl = (id, data) => API.put(`/urls/${id}`, data);
export const getAnalytics = (id) => API.get(`/urls/${id}/analytics`);