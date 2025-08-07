// API base configuration
const API_BASE_URL = '/api';

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  userType: 'ADMIN' | 'END_USER';
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: string;
  title: string;
  specialty: string;
  summary: string;
  authors?: string;
  journal?: string;
  year?: string;
  thumbnail?: string;
  viewerCount: number;
  presentationFileUrl?: string;
  originalArticleUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  user?: {
    id: string;
    username: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface PaginatedResponse<T> {
  data?: T[];
  presentations?: T[];
  users?: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Storage utilities
export const getToken = (): string | null => {
  return localStorage.getItem('authToken');
};

export const setToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('authToken');
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem('currentUser');
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem('currentUser', JSON.stringify(user));
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem('currentUser');
};

// Backend availability flag
let isBackendAvailable: boolean | null = null;

// Check if backend is available
const checkBackendAvailability = async (): Promise<boolean> => {
  if (isBackendAvailable !== null) {
    return isBackendAvailable;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    isBackendAvailable = response.ok;
    return isBackendAvailable;
  } catch (error) {
    console.log('Backend not available, falling back to client-side data');
    isBackendAvailable = false;
    return false;
  }
};

// API request helper
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getToken();

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  } catch (error) {
    // Mark backend as unavailable on network errors
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      isBackendAvailable = false;
    }
    throw error;
  }
};

// Auth API
export const authAPI = {
  async register(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    userType?: 'ADMIN' | 'END_USER';
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(): Promise<{ user: User }> {
    return apiRequest<{ user: User }>('/users/me');
  },

  async updateProfile(data: Partial<User>): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  logout(): void {
    removeToken();
    removeCurrentUser();
  },
};

// Users API (Admin only)
export const usersAPI = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    userType?: 'ADMIN' | 'END_USER';
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.userType) searchParams.append('userType', params.userType);

    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<User>>(`/users${query ? `?${query}` : ''}`);
  },

  async getUser(id: string): Promise<{ user: User }> {
    return apiRequest<{ user: User }>(`/users/${id}`);
  },

  async updateUser(id: string, data: Partial<User>): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    });
  },
};

// Presentations API
export const presentationsAPI = {
  async getPresentations(params?: {
    page?: number;
    limit?: number;
    specialty?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Presentation>> {
    // Check if backend is available first
    const backendAvailable = await checkBackendAvailability();

    if (!backendAvailable) {
      // Return empty response when backend is not available
      return {
        presentations: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0
        }
      };
    }

    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.specialty) searchParams.append('specialty', params.specialty);
    if (params?.search) searchParams.append('search', params.search);
    if (params?.sortBy) searchParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.append('sortOrder', params.sortOrder);

    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<Presentation>>(`/presentations${query ? `?${query}` : ''}`);
  },

  async getPresentation(id: string): Promise<{ presentation: Presentation }> {
    return apiRequest<{ presentation: Presentation }>(`/presentations/${id}`);
  },

  async createPresentation(data: Omit<Presentation, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'user' | 'viewerCount'>): Promise<{ message: string; presentation: Presentation }> {
    return apiRequest<{ message: string; presentation: Presentation }>('/presentations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePresentation(id: string, data: Partial<Presentation>): Promise<{ message: string; presentation: Presentation }> {
    return apiRequest<{ message: string; presentation: Presentation }>(`/presentations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async deletePresentation(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/presentations/${id}`, {
      method: 'DELETE',
    });
  },

  async incrementViewCount(id: string): Promise<{ viewerCount: number }> {
    return apiRequest<{ viewerCount: number }>(`/presentations/${id}/view`, {
      method: 'POST',
    });
  },

  async getSpecialties(): Promise<{ specialties: string[] }> {
    return apiRequest<{ specialties: string[] }>('/presentations/specialties');
  },

  async getStats(): Promise<{
    totalPresentations: number;
    totalViews: number;
    specialtyDistribution: Array<{ specialty: string; count: number }>;
    recentPresentations: Array<{
      id: string;
      title: string;
      specialty: string;
      viewerCount: number;
      createdAt: string;
    }>;
  }> {
    return apiRequest('/presentations/stats/overview');
  },
};

// Health check
export const healthAPI = {
  async check(): Promise<{ status: string; timestamp: string; environment: string }> {
    return apiRequest<{ status: string; timestamp: string; environment: string }>('/health');
  },
};

export default {
  auth: authAPI,
  users: usersAPI,
  presentations: presentationsAPI,
  health: healthAPI,
};
