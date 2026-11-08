import axios from 'axios';

const rawApiUrl = import.meta.env.VITE_API_URL;
let baseURL = '/api/v1';

if (rawApiUrl) {
  const normalized = rawApiUrl.startsWith('http') ? rawApiUrl : `https://${rawApiUrl}`;
  baseURL = normalized.endsWith('/api/v1') ? normalized : `${normalized}/api/v1`;
}

export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('algions_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If token expired, clear and notify
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('algions_token');
        localStorage.removeItem('algions_user');
      }
    }
    return Promise.reject(error);
  }
);
