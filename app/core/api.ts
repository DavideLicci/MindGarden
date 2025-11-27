import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:3000');

export const api = {
  // Auth endpoints
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  logout: `${API_BASE_URL}/api/auth/logout`,

  // Check-in endpoints
  checkins: `${API_BASE_URL}/api/checkins`,

  // Garden endpoints
  gardens: `${API_BASE_URL}/api/gardens`,
  plants: `${API_BASE_URL}/api/plants`,

  // Analytics endpoints
  analytics: `${API_BASE_URL}/api/analytics`,

  // Insights endpoints
  insights: `${API_BASE_URL}/api/insights`,

  // Chatbot endpoints
  chatbot: `${API_BASE_URL}/api/chatbot`,

  // Settings endpoints
  settings: `${API_BASE_URL}/api/settings`,

  // Export endpoints
  export: `${API_BASE_URL}/api/export`,

  // Upload endpoints
  uploads: `${API_BASE_URL}/api/uploads`,
};

export interface User {
  id: number;
  email: string;
  createdAt?: string;
}

export interface AuthResponse {
  tokens: {
    accessToken: string;
  };
  user: User;
}

export const apiService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(api.login, { email, password });
    return response.data;
  },

  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(api.register, { email, password });
    return response.data;
  },
};

export default api;
