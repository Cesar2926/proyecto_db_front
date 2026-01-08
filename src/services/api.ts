import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;
console.log('API URL:', apiUrl);

const api = axios.create({
  baseURL: apiUrl,
  timeout: 60_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
