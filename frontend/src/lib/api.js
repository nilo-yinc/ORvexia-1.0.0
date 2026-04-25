import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://orvexia-backend.vercel.app',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
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
  }
};

export default api;
