import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || (process.env.NODE_ENV === 'production' ? '' : 'http://localhost:3000');

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

export interface Garden {
  gardenId: string;
  userId: string;
  createdAt: string;
  plants: PlantInstance[];
  aggregate?: any;
}

export interface PlantInstance {
  id: string;
  userId: string;
  checkinId: string;
  archetype: string;
  params?: any;
  position: { x: number; y: number; z: number };
  styleSkin?: string;
  health: number;
  growthProgress: number;
  createdAt: string;
}

export interface CheckInData {
  userId: string;
  text?: string;
  emotionHint?: string;
  intensity: number;
  tags: string[];
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

  async getGarden(): Promise<Garden> {
    const token = localStorage.getItem('token');
    const response = await axios.get<Garden>(api.gardens, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async performPlantAction(plantId: string, actionData: any): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.post(`${api.plants}/${plantId}/action`, actionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createCheckIn(checkInData: CheckInData): Promise<any> {
    const token = localStorage.getItem('token');
    const response = await axios.post(api.checkins, checkInData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },
};

export default api;
