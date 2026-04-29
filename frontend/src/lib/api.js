import axios from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Workflow API endpoints
export const workflowApi = {
  getAll: async () => {
    const response = await api.get('/workflows');
    return response.data;
  },
  
  getById: async (id) => {
    const response = await api.get(`/workflows/${id}`);
    return response.data;
  },

  create: async (data) => {
    const response = await api.post('/workflows', data);
    return response.data;
  },

  execute: async (id, payload = {}) => {
    const response = await api.post(`/workflows/${id}/execute`, payload);
    return response.data;
  },

  executions: async (id) => {
    const response = await api.get(`/workflows/${id}/executions`);
    return response.data;
  },

  getGlobalExecutions: async (limit = 5) => {
    const response = await api.get(`/workflows/executions`, { params: { limit } });
    return response.data;
  },

  delete: async (id) => {
    const response = await api.delete(`/workflows/${id}`);
    return response.data;
  },

  toggle: async (id, isActive) => {
    const response = await api.patch(`/workflows/${id}/toggle`, { is_active: isActive });
    return response.data;
  }
};

export const appsApi = {
  list: async () => {
    const response = await api.get('/apps');
    return response.data;
  },

  connections: async () => {
    const response = await api.get('/apps/connections');
    return response.data;
  },

  saveConnection: async (appKey, data) => {
    const response = await api.post(`/apps/${appKey}/connection`, data);
    return response.data;
  },
};

export const aiApi = {
  getConversation: async (workflowId) => {
    const response = await api.get(`/ai/conversation/${workflowId}`);
    return response.data;
  },

  saveConversation: async (workflowId, messages) => {
    const response = await api.put(`/ai/conversation/${workflowId}`, { messages });
    return response.data;
  },
};

export const blueprintApi = {
  list: async (params) => {
    const response = await api.get('/blueprints', { params });
    return response.data;
  },
  share: async (data) => {
    const response = await api.post('/blueprints/share', data);
    return response.data;
  }
};

export default api;
