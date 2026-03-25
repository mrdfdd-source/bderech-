import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('baderech_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('baderech_token');
      localStorage.removeItem('baderech_user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

// Plans API
export const plansAPI = {
  create: (data) => api.post('/plans/create', data),
  getCurrent: () => api.get('/plans/current'),
  completeToday: (planId) => api.post(`/plans/${planId}/complete-today`),
  getMap: (planId) => api.get(`/plans/${planId}/map`),
  abandon: (planId) => api.post(`/plans/${planId}/abandon`)
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  movementHelp: (data) => api.post('/chat/movement-help', data),
  clearSession: (data) => api.post('/chat/clear', data)
};

export default api;
