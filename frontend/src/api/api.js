import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
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

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  register: (username, email, password) => api.post('/auth/register', { username, email, password }),
  verify: () => api.get('/auth/verify'),
};

export const mediaAPI = {
  getAll: (params) => api.get('/media', { params }),
  getById: (id) => api.get(`/media/${id}`),
  updateProgress: (id, progress, completed) => 
    api.post(`/media/${id}/progress`, { progress, completed }),
  getRecent: () => api.get('/media/history/recent'),
};

export const libraryAPI = {
  scan: () => api.post('/library/scan'),
  getStats: () => api.get('/library/stats'),
};

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.put('/users/me', data),
};

export const streamAPI = {
  getDirectUrl: (id) => `/api/stream/direct/${id}`,
  getTranscodeUrl: (id, quality) => `/api/stream/transcode/${id}?quality=${quality}`,
};

export default api;
