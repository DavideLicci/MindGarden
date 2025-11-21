import axios from 'axios';

// Types based on OpenAPI spec
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Tokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: Tokens;
}

export interface CheckIn {
  id: string;
  userId: string;
  createdAt: string;
  timestamp: string;
  text?: string;
  sttText?: string;
  audioObjectKey?: string;
  emotionLabel?: string;
  sentimentScore?: number;
  intensity?: number;
  tags?: string[];
  embeddingsId?: string;
  status?: string;
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

export interface Garden {
  gardenId: string;
  userId: string;
  createdAt: string;
  plants: PlantInstance[];
  aggregate?: any;
}

class ApiService {
  private api: any;
  private baseURL = 'http://localhost:4000';

  constructor() {
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use((config: any) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  // Auth methods
  async register(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post('/auth/register', {
      email,
      password,
    });
    return response.data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await this.api.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  // Check-in methods
  async createCheckIn(checkInData: {
    text?: string;
    sttText?: string;
    audioObjectKey?: string;
    emotionHint?: string;
    intensity?: number;
    tags?: string[];
  }): Promise<CheckIn> {
    const response = await this.api.post('/checkins', checkInData);
    return response.data;
  }

  async getCheckIns(params?: {
    from?: string;
    to?: string;
    emotion?: string;
    limit?: number;
  }): Promise<CheckIn[]> {
    const response = await this.api.get('/checkins', { params });
    return response.data;
  }

  async getCheckIn(id: string): Promise<CheckIn> {
    const response = await this.api.get(`/checkins/${id}`);
    return response.data;
  }

  // Garden methods
  async getGarden(): Promise<Garden> {
    const response = await this.api.get('/gardens/me');
    return response.data;
  }

  // Plant methods
  async getPlant(plantId: string): Promise<PlantInstance> {
    const response = await this.api.get(`/plants/${plantId}`);
    return response.data;
  }

  async performPlantAction(plantId: string, action: {
    userId: string;
    action: string;
    metadata?: any;
  }): Promise<PlantInstance> {
    const response = await this.api.post(`/plants/${plantId}/actions`, action);
    return response.data;
  }

  // Insights methods
  async getInsights(limit?: number): Promise<any[]> {
    const response = await this.api.get('/insights', { params: { limit } });
    return response.data;
  }

  async generateInsights(data: {
    fromDate?: string;
    toDate?: string;
    checkinIds?: string[];
  }): Promise<{ jobId: string }> {
    const response = await this.api.post('/insights/generate', data);
    return response.data;
  }

  // Settings methods
  async getSettings(): Promise<any> {
    const response = await this.api.get('/settings/me');
    return response.data;
  }

  async updateSettings(settings: any): Promise<any> {
    const response = await this.api.patch('/settings/me', settings);
    return response.data;
  }

  // Upload methods
  async getSignedUrl(data: {
    contentType: string;
    lengthSeconds?: number;
  }): Promise<{ uploadUrl: string; objectKey: string }> {
    const response = await this.api.post('/uploads/signed-url', data);
    return response.data;
  }
}

export const apiService = new ApiService();
