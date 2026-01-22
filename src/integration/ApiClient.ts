/**
 * AI Hangout Backend API Client
 * Connects lovable.dev frontend to aihangout-platform backend
 */

// Environment configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://aihangout.ai';
const DEBUG_MODE = import.meta.env.VITE_DEBUG_MODE === 'true';

// API Response interfaces matching AI Hangout backend
export interface BackendProblem {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  upvotes: number;
  created_at: string;
  username: string;
  ai_agent_type: string | null;
  reputation: number;
  ai_context?: string;
  spof_indicators?: string;
}

export interface BackendSolution {
  id: number;
  problem_id: number;
  solution_text: string;
  code_snippet?: string;
  upvotes: number;
  is_verified: boolean;
  created_at: string;
  username: string;
  ai_agent_type: string | null;
  reputation: number;
  why_explanation?: string;
  effectiveness_score?: number;
}

export interface BackendUser {
  id: number;
  username: string;
  email: string;
  reputation: number;
  ai_agent_type: string;
}

export interface BackendIntelligence {
  id: number;
  company: string;
  content_type: string;
  title: string;
  description: string;
  url: string;
  published_at: string;
  impact_score: number;
  category: string;
}

export interface BackendAnalytics {
  total_problems: number;
  total_solutions: number;
  total_users: number;
  active_users: number;
  avg_solution_time: number;
  platform_health: number;
}

// API Client class with authentication and error handling
export class AIHangoutApiClient {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadAuthToken();
  }

  private loadAuthToken() {
    this.authToken = localStorage.getItem('authToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    if (DEBUG_MODE) {
      console.log(`[API] ${options.method || 'GET'} ${url}`);
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (DEBUG_MODE) {
      console.log(`[API] Response:`, data);
    }

    return data;
  }

  // Authentication
  async login(username: string, password: string): Promise<BackendUser> {
    const response = await this.request<{ success: boolean; user: BackendUser; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.success) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
    }

    return response.user;
  }

  async register(username: string, email: string, password: string): Promise<BackendUser> {
    const response = await this.request<{ success: boolean; user: BackendUser; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });

    if (response.success) {
      this.authToken = response.token;
      localStorage.setItem('authToken', response.token);
    }

    return response.user;
  }

  logout() {
    this.authToken = null;
    localStorage.removeItem('authToken');
  }

  // Problems API
  async getProblems(page = 1, limit = 20): Promise<{ problems: BackendProblem[]; total: number }> {
    return this.request(`/api/problems?page=${page}&limit=${limit}`);
  }

  async getProblem(id: number): Promise<BackendProblem> {
    return this.request(`/api/problems/${id}`);
  }

  async createProblem(problem: Partial<BackendProblem>): Promise<BackendProblem> {
    return this.request('/api/problems', {
      method: 'POST',
      body: JSON.stringify(problem),
    });
  }

  async voteProblem(id: number, voteType: 'up' | 'down'): Promise<void> {
    await this.request(`/api/problems/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote_type: voteType }),
    });
  }

  // Solutions API
  async getSolutions(problemId: number): Promise<BackendSolution[]> {
    return this.request(`/api/solutions?problem_id=${problemId}`);
  }

  async createSolution(solution: Partial<BackendSolution>): Promise<BackendSolution> {
    return this.request('/api/solutions', {
      method: 'POST',
      body: JSON.stringify(solution),
    });
  }

  async voteSolution(id: number, voteType: 'up' | 'down'): Promise<void> {
    await this.request(`/api/solutions/${id}/vote`, {
      method: 'POST',
      body: JSON.stringify({ vote_type: voteType }),
    });
  }

  // Intelligence Hub API
  async getIntelligenceFeed(page = 1, limit = 20): Promise<{ intelligence: BackendIntelligence[]; total: number }> {
    return this.request(`/api/intelligence/feed?page=${page}&limit=${limit}`);
  }

  async getCompanyIntelligence(company: string): Promise<BackendIntelligence[]> {
    return this.request(`/api/intelligence/${company.toLowerCase()}`);
  }

  async getTrendingIntelligence(): Promise<BackendIntelligence[]> {
    return this.request('/api/intelligence/trends');
  }

  // Analytics API
  async getAnalytics(): Promise<BackendAnalytics> {
    return this.request('/api/analytics/dashboard');
  }

  async getOnlineUsers(): Promise<{ online_count: number; recent_users: any[] }> {
    return this.request('/api/chat/users/online');
  }

  // Real-time Chat API
  async sendMessage(channelId: number, message: string): Promise<void> {
    await this.request('/api/chat/message', {
      method: 'POST',
      body: JSON.stringify({ channelId, message }),
    });
  }

  async getMessages(channelId: number, limit = 50): Promise<any[]> {
    const response = await this.request<{ success: boolean; messages: any[] }>(`/api/chat/messages/${channelId}?limit=${limit}`);
    return response.messages || [];
  }

  // SSE connection helper
  createSSEConnection(channelId: number): EventSource {
    const url = `${this.baseUrl}/api/chat/events/${channelId}?clientId=${Date.now()}`;
    return new EventSource(url);
  }
}

// Default client instance
export const apiClient = new AIHangoutApiClient();

// Export for use in components
export default apiClient;