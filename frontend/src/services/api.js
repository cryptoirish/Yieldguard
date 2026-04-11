import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

// Request interceptor to add JWT token
API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for 401 (unauthorized)
API.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const auth = {
  signup: (email, password, restaurant_name) =>
    API.post('/auth/signup', { email, password, restaurant_name }),
  login: (email, password) =>
    API.post('/auth/login', { email, password }),
  logout: () => {
    localStorage.clear();
  }
};

// Inventory endpoints
export const inventory = {
  getAll: () => API.get('/inventory'),
  add: (item) => API.post('/inventory', item),
  updateQuantity: (id, quantity) => API.put(`/inventory/${id}`, { quantity }),
  delete: (id) => API.delete(`/inventory/${id}`),
  getWaste: (period = 7) => API.get(`/inventory/waste?period=${period}`)
};

// HACCP endpoints
export const haccp = {
  getLogs: () => API.get('/haccp/logs'),
  addLog: (log) => API.post('/haccp/logs', log),
  getViolations: () => API.get('/haccp/violations')
};

export default API;
