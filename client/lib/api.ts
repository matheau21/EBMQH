// API base configuration
const API_BASE_URL = "/api";

// Types
export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  userType: "ADMIN" | "END_USER";
  role?: "owner" | "admin" | "user";
  createdAt: string;
  updatedAt: string;
}

export interface Presentation {
  id: string;
  title: string;
  specialty: string;
  specialties?: string[];
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

export interface QuestionChoice {
  id: string;
  content: string;
  isCorrect: boolean;
  orderIndex: number;
}

export interface QuestionHighlight {
  page: number;
  phrase: string;
  occurrence?: number;
  color?: string;
  note?: string;
}

export interface Question {
  id: string;
  prompt: string;
  specialty?: string;
  presentationId?: string;
  explanation?: string;
  referenceUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  choices: QuestionChoice[];
  highlights?: QuestionHighlight[];
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
  return localStorage.getItem("authToken");
};

export const setToken = (token: string): void => {
  localStorage.setItem("authToken", token);
};

export const removeToken = (): void => {
  localStorage.removeItem("authToken");
};

export const getCurrentUser = (): User | null => {
  const userStr = localStorage.getItem("currentUser");
  return userStr ? JSON.parse(userStr) : null;
};

export const setCurrentUser = (user: User): void => {
  localStorage.setItem("currentUser", JSON.stringify(user));
};

export const removeCurrentUser = (): void => {
  localStorage.removeItem("currentUser");
};

// Backend availability flag
let isBackendAvailable: boolean | null = null;
let lastBackendCheck: number = 0;
const BACKEND_CHECK_INTERVAL = 30000; // 30 seconds

// Check if backend is available
const checkBackendAvailability = async (): Promise<boolean> => {
  const now = Date.now();

  // Use cached result within interval
  if (
    isBackendAvailable !== null &&
    now - lastBackendCheck < BACKEND_CHECK_INTERVAL
  ) {
    return isBackendAvailable;
  }

  lastBackendCheck = now;

  // Timeout after 5 seconds to avoid hanging fetches
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);

  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
    });
    isBackendAvailable = !!response && response.ok === true;
    return isBackendAvailable;
  } catch (_err) {
    // Swallow network errors; treat backend as unavailable
    isBackendAvailable = false;
    return false;
  } finally {
    clearTimeout(timeout);
  }
};

// API request helper with graceful offline fallbacks for GET requests
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> => {
  const token = getToken();
  const method = (options.method || "GET").toUpperCase();

  const controller = new AbortController();
  const timeoutMs = 8000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    cache: "no-store",
    signal: controller.signal,
    ...options,
  };

  const fallbackFor = (ep: string): any => {
    if (ep.startsWith("/presentations")) {
      if (ep.endsWith("/files")) return {};
      if (ep.endsWith("/specialties")) return { specialties: [] };
      if (/\/view$/.test(ep)) return { viewerCount: 0 };
      return {
        presentations: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };
    }
    if (ep.startsWith("/site/featured")) return { presentations: [] };
    if (ep.startsWith("/site/about"))
      return {
        title: "About EBM Quick Hits",
        subtitle: "",
        sections: [],
        referenceCard: {},
      };
    if (ep.startsWith("/site/contact"))
      return {
        title: "Contact Us",
        body: "Email us at example@example.com",
        email: null,
      };
    if (ep.startsWith("/questions"))
      return {
        questions: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      };
    if (ep.startsWith("/admin/users")) return { users: [] };
    if (ep.startsWith("/health"))
      return {
        status: "offline",
        timestamp: new Date().toISOString(),
        environment: "offline",
      };
    return {};
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        message = data?.error || message;
      } catch {
        try {
          const text = await response.text();
          try {
            const parsed = JSON.parse(text);
            message = parsed?.error || message;
          } catch {
            message = text || "Network error";
          }
        } catch {
          message = "Network error";
        }
      }
      throw new Error(message);
    }

    return response.json();
  } catch (error: any) {
    const msg = String(error?.message || "");
    const name = String((error as any)?.name || "");
    const isNetworkError =
      error instanceof TypeError && msg.includes("Failed to fetch");
    const isAbortError = /abort/i.test(msg) || name === "AbortError";

    if (isNetworkError || isAbortError) {
      isBackendAvailable = false;
      lastBackendCheck = Date.now();
      if (method === "GET") {
        // Graceful fallback for GETs when network or abort/timeouts happen
        return fallbackFor(endpoint) as T;
      }
      // For writes, surface a friendly error
      throw new Error(isAbortError ? "Request timed out. Please try again." : "Network error. Please try again.");
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
};

// Auth API (legacy, Prisma-backed)
export const authAPI = {
  async register(data: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
    userType?: "ADMIN" | "END_USER";
  }): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/users/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    return apiRequest<AuthResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getProfile(): Promise<{ user: User }> {
    try {
      const backendAvailable = await checkBackendAvailability();

      if (!backendAvailable) {
        throw new Error("Backend not available");
      }

      return apiRequest<{ user: User }>("/users/me");
    } catch (error) {
      console.log("Error getting user profile:", error);
      throw error;
    }
  },

  async updateProfile(
    data: Partial<User>,
  ): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>("/users/me", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  logout(): void {
    removeToken();
    removeCurrentUser();
  },
};

// Admin Auth API (Supabase-backed)
export const adminAuthAPI = {
  async login(
    username: string,
    password: string,
  ): Promise<{
    message: string;
    token: string;
    user: {
      id: string;
      username: string;
      role: "owner" | "admin" | "user";
      is_active: boolean;
      created_at: string;
      updated_at: string;
      last_login_at: string | null;
    };
  }> {
    const response = await apiRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    const { token } = response as any;
    if (token) setToken(token);
    return response as any;
  },

  async me(): Promise<{
    user: {
      id: string;
      username: string;
      role: "owner" | "admin" | "user";
      is_active: boolean;
      created_at: string;
      updated_at: string;
      last_login_at: string | null;
    };
  }> {
    return apiRequest("/admin/me");
  },

  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<{ message: string }> {
    return apiRequest(`/admin/change-password`, {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};

// Users API (Admin only)
export const usersAPI = {
  async getUsers(params?: {
    page?: number;
    limit?: number;
    userType?: "ADMIN" | "END_USER";
  }): Promise<PaginatedResponse<User>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.userType) searchParams.append("userType", params.userType);

    const query = searchParams.toString();
    return apiRequest<PaginatedResponse<User>>(
      `/users${query ? `?${query}` : ""}`,
    );
  },

  async getUser(id: string): Promise<{ user: User }> {
    return apiRequest<{ user: User }>(`/users/${id}`);
  },

  async updateUser(
    id: string,
    data: Partial<User>,
  ): Promise<{ message: string; user: User }> {
    return apiRequest<{ message: string; user: User }>(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteUser(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/users/${id}`, {
      method: "DELETE",
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
    sortOrder?: "asc" | "desc";
  }): Promise<PaginatedResponse<Presentation>> {
    try {
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
            pages: 0,
          },
        };
      }

      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append("page", params.page.toString());
      if (params?.limit) searchParams.append("limit", params.limit.toString());
      if (params?.specialty) searchParams.append("specialty", params.specialty);
      if (params?.search) searchParams.append("search", params.search);
      if (params?.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const query = searchParams.toString();
      return apiRequest<PaginatedResponse<Presentation>>(
        `/presentations${query ? `?${query}` : ""}`,
      );
    } catch (error) {
      console.warn(
        "Error fetching presentations from API, returning empty result",
      );
      // Return empty response on any error
      return {
        presentations: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
        },
      };
    }
  },

  async getPresentation(id: string): Promise<{ presentation: Presentation }> {
    return apiRequest<{ presentation: Presentation }>(`/presentations/${id}`);
  },

  async adminGet(id: string): Promise<{ presentation: any }> {
    return apiRequest(`/presentations/admin/${id}`);
  },

  async createPresentation(
    data: Partial<Presentation> & {
      title: string;
      specialty?: string;
      specialties?: string[];
      summary: string;
      originalArticleUrl?: string;
      thumbUrl?: string;
    },
  ): Promise<{ message: string; presentation: Presentation }> {
    try {
      return apiRequest<{ message: string; presentation: Presentation }>(
        "/presentations",
        {
          method: "POST",
          body: JSON.stringify(data),
        },
      );
    } catch (error) {
      console.log("Error creating presentation via API:", error);
      throw error;
    }
  },

  async updatePresentation(
    id: string,
    data: Partial<Presentation>,
  ): Promise<{ message: string; presentation: Presentation }> {
    return apiRequest<{ message: string; presentation: Presentation }>(
      `/presentations/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );
  },

  async deletePresentation(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/presentations/${id}`, {
      method: "DELETE",
    });
  },

  async uploadFile(
    id: string,
    file: File,
  ): Promise<{ message: string; path: string }> {
    const ext = file.name.split(".").pop()?.toLowerCase();
    const type =
      ext === "pdf"
        ? "pdf"
        : ext === "ppt"
          ? "ppt"
          : ext === "pptx"
            ? "pptx"
            : undefined;
    if (!type)
      throw new Error("Unsupported file type. Allowed: pdf, ppt, pptx");
    if (file.size > 50 * 1024 * 1024)
      throw new Error("File too large (max 50MB)");

    // Use FileReader to avoid call stack overflow with large files
    const base64: string = await new Promise((resolve, reject) => {
      try {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const idx = result.indexOf(",");
          resolve(idx >= 0 ? result.slice(idx + 1) : result);
        };
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      } catch (e) {
        reject(e);
      }
    });

    return apiRequest<{ message: string; path: string }>(
      `/presentations/${id}/upload`,
      {
        method: "POST",
        body: JSON.stringify({
          fileType: type,
          filename: file.name,
          contentBase64: base64,
        }),
      },
    );
  },

  async deleteFile(
    id: string,
    type: "pdf" | "ppt",
  ): Promise<{ message: string }> {
    const url = `/presentations/${id}/file?type=${encodeURIComponent(type)}`;
    return apiRequest(url, { method: "DELETE" });
  },

  async getFileUrls(id: string): Promise<{ pdfUrl?: string; pptUrl?: string }> {
    try {
      const backendAvailable = await checkBackendAvailability();
      if (!backendAvailable) return {} as any;
      return await apiRequest<{ pdfUrl?: string; pptUrl?: string }>(
        `/presentations/${id}/files`,
      );
    } catch (_e) {
      return {} as any;
    }
  },

  async incrementViewCount(id: string): Promise<{ viewerCount: number }> {
    return apiRequest<{ viewerCount: number }>(`/presentations/${id}/view`, {
      method: "POST",
    });
  },

  async getSpecialties(): Promise<{ specialties: string[] }> {
    try {
      return await apiRequest<{ specialties: string[] }>(
        "/presentations/specialties",
      );
    } catch (e) {
      console.warn("getSpecialties failed, returning empty", e);
      return { specialties: [] };
    }
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
    return apiRequest("/presentations/stats/overview");
  },

  async adminList(params?: {
    page?: number;
    limit?: number;
    specialty?: string;
    search?: string;
    status?: "pending" | "approved" | "rejected";
  }): Promise<PaginatedResponse<any>> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.append("page", String(params.page));
      if (params?.limit) sp.append("limit", String(params.limit));
      if (params?.specialty) sp.append("specialty", params.specialty);
      if (params?.search) sp.append("search", params.search);
      if (params?.status) sp.append("status", params.status);
      const q = sp.toString();
      return await apiRequest(`/presentations/admin${q ? `?${q}` : ""}`);
    } catch (e) {
      console.warn("adminList failed, returning empty", e);
      return {
        presentations: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 },
      } as any;
    }
  },

  async updateStatus(
    id: string,
    status: "pending" | "approved" | "rejected" | "archived",
  ): Promise<{ message: string; presentation: any }> {
    return apiRequest(`/presentations/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
};

// Questions API
export const questionsAPI = {
  async list(params?: {
    specialty?: string;
    presentationId?: string;
    limit?: number;
    random?: boolean;
  }): Promise<{
    questions: Question[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const backendAvailable = await checkBackendAvailability();
      if (!backendAvailable) {
        return {
          questions: [],
          pagination: {
            page: 1,
            limit: params?.limit || 10,
            total: 0,
            pages: 0,
          },
        };
      }
      const sp = new URLSearchParams();
      if (params?.specialty) sp.append("specialty", params.specialty);
      if (params?.presentationId)
        sp.append("presentationId", params.presentationId);
      if (params?.limit) sp.append("limit", String(params.limit));
      if (params?.random) sp.append("random", "1");
      const q = sp.toString();
      return apiRequest(`/questions${q ? `?${q}` : ""}`);
    } catch (e) {
      console.warn("Questions list failed, returning empty", e);
      return {
        questions: [],
        pagination: { page: 1, limit: params?.limit || 10, total: 0, pages: 0 },
      } as any;
    }
  },
  async adminList(params?: {
    page?: number;
    limit?: number;
    specialty?: string;
    presentationId?: string;
    status?: "pending" | "approved" | "rejected";
  }): Promise<{
    questions: Question[];
    pagination: { page: number; limit: number; total: number; pages: number };
  }> {
    try {
      const sp = new URLSearchParams();
      if (params?.page) sp.append("page", String(params.page));
      if (params?.limit) sp.append("limit", String(params.limit));
      if (params?.specialty) sp.append("specialty", params.specialty);
      if (params?.presentationId)
        sp.append("presentationId", params.presentationId);
      if (params?.status) sp.append("status", params.status);
      const q = sp.toString();
      return await apiRequest(`/questions/admin${q ? `?${q}` : ""}`);
    } catch (e) {
      console.warn("Admin questions list failed, returning empty", e);
      return {
        questions: [],
        pagination: {
          page: 1,
          limit: params?.limit || 10 || 10,
          total: 0,
          pages: 0,
        },
      } as any;
    }
  },
  async get(id: string): Promise<{ question: Question }> {
    return apiRequest(`/questions/${id}`);
  },
  async create(input: {
    prompt: string;
    specialty?: string;
    presentationId?: string;
    explanation?: string;
    referenceUrl?: string;
    isActive?: boolean;
    choices: Array<{ content: string; isCorrect: boolean }>;
    highlights?: QuestionHighlight[];
  }): Promise<{ message: string; question: Question }> {
    return apiRequest(`/questions`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async update(
    id: string,
    input: Partial<{
      prompt: string;
      specialty?: string | null;
      presentationId?: string | null;
      explanation?: string | null;
      referenceUrl?: string | null;
      isActive?: boolean;
      choices: Array<{ content: string; isCorrect: boolean }>;
      highlights?: QuestionHighlight[] | null;
    }>,
  ): Promise<{ message: string; question: Question }> {
    return apiRequest(`/questions/${id}`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
  async remove(id: string): Promise<{ message: string }> {
    return apiRequest(`/questions/${id}`, { method: "DELETE" });
  },
  async updateStatus(
    id: string,
    status: "pending" | "approved" | "rejected",
  ): Promise<{ message: string; question: Question }> {
    return apiRequest(`/questions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },
  async myList(): Promise<{ questions: Question[] }> {
    return apiRequest(`/questions/my`);
  },
};

// Site API
export const siteAPI = {
  async getAbout(): Promise<{
    title: string;
    subtitle?: string | null;
    sections: Array<{ heading: string; body: string }>;
    referenceCard?: {
      url?: string | null;
      filePath?: string | null;
      signedUrl?: string | null;
    };
  }> {
    try {
      const backendAvailable = await checkBackendAvailability();
      if (!backendAvailable) {
        return {
          title: "About EBM Quick Hits",
          subtitle: "",
          sections: [],
          referenceCard: {},
        } as any;
      }
      return await apiRequest(`/site/about`);
    } catch {
      return {
        title: "About EBM Quick Hits",
        sections: [],
        referenceCard: {},
      } as any;
    }
  },
  async saveAbout(input: {
    title: string;
    subtitle?: string | null;
    sections: Array<{ heading: string; body: string }>;
    referenceCard?: { url?: string | null; filePath?: string | null };
  }): Promise<{ message: string }> {
    return apiRequest(`/site/about`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
  async uploadReference(
    file: File,
  ): Promise<{ message: string; path: string }> {
    const base64: string = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const idx = result.indexOf(",");
        resolve(idx >= 0 ? result.slice(idx + 1) : result);
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsDataURL(file);
    });
    return apiRequest(`/site/reference/upload`, {
      method: "POST",
      body: JSON.stringify({ filename: file.name, contentBase64: base64 }),
    });
  },
  async getFeaturedPresentations(): Promise<{ presentations: Presentation[] }> {
    try {
      const backendAvailable = await checkBackendAvailability();
      if (!backendAvailable) {
        const r = await presentationsAPI.getPresentations({ limit: 3 });
        return { presentations: (r.presentations || []).slice(0, 3) as any };
      }
      return await apiRequest(`/site/featured`);
    } catch {
      const r = await presentationsAPI.getPresentations({ limit: 3 });
      return { presentations: (r.presentations || []).slice(0, 3) as any };
    }
  },
  async saveFeatured(ids: string[]): Promise<{ message: string }> {
    return apiRequest(`/site/featured`, {
      method: "PUT",
      body: JSON.stringify({ ids }),
    });
  },
  async getContact(): Promise<{
    title: string;
    body: string;
    email?: string | null;
  }> {
    try {
      const backendAvailable = await checkBackendAvailability();
      if (!backendAvailable)
        return {
          title: "Contact Us",
          body: "Email us at example@example.com",
          email: null,
        } as any;
      return await apiRequest(`/site/contact`);
    } catch {
      return {
        title: "Contact Us",
        body: "Email us at example@example.com",
        email: null,
      } as any;
    }
  },
  async saveContact(input: {
    title: string;
    body: string;
    email?: string | null;
  }): Promise<{ message: string }> {
    return apiRequest(`/site/contact`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
  async getPrivacy(): Promise<{
    title: string;
    subtitle?: string | null;
    sections: Array<{ heading: string; body: string }>;
  }> {
    try {
      const backendAvailable = await checkBackendAvailability();
      if (!backendAvailable)
        return {
          title: "Privacy Policy",
          subtitle: "",
          sections: [
            { heading: "Your Privacy", body: "We value your privacy and do not sell your information." },
            { heading: "Data Usage", body: "We collect only what's necessary to operate the site and improve user experience." },
          ],
        } as any;
      return await apiRequest(`/site/privacy`);
    } catch {
      return {
        title: "Privacy Policy",
        sections: [
          { heading: "Your Privacy", body: "We value your privacy and do not sell your information." },
        ],
      } as any;
    }
  },
  async savePrivacy(input: {
    title: string;
    subtitle?: string | null;
    sections: Array<{ heading: string; body: string }>;
  }): Promise<{ message: string }> {
    return apiRequest(`/site/privacy`, {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
};

// Health check
export const healthAPI = {
  async check(): Promise<{
    status: string;
    timestamp: string;
    environment: string;
  }> {
    return apiRequest<{
      status: string;
      timestamp: string;
      environment: string;
    }>("/health");
  },
};

// Export backend availability check
export { checkBackendAvailability };

export const adminUsersAPI = {
  async list(): Promise<{
    users: Array<{
      id: string;
      username: string;
      role: "owner" | "admin" | "user";
      is_active: boolean;
      created_at: string;
      updated_at: string;
      last_login_at: string | null;
    }>;
  }> {
    try {
      return await apiRequest("/admin/users");
    } catch (e) {
      console.warn("Admin users list failed, returning empty list", e);
      return { users: [] } as any;
    }
  },
  async create(input: {
    username: string;
    password: string;
    role: "owner" | "admin" | "user";
    is_active?: boolean;
  }): Promise<{ message: string; user: any }> {
    return apiRequest("/admin/users", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  async update(
    id: string,
    input: {
      password?: string;
      role?: "owner" | "admin" | "user";
      is_active?: boolean;
    },
  ): Promise<{ message: string; user: any }> {
    return apiRequest(`/admin/users/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  async remove(id: string): Promise<{ message: string }> {
    return apiRequest(`/admin/users/${id}`, { method: "DELETE" });
  },
};

export default {
  auth: authAPI,
  users: usersAPI,
  presentations: presentationsAPI,
  questions: questionsAPI,
  health: healthAPI,
  adminUsers: adminUsersAPI,
};
