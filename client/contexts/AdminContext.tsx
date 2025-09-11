import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  adminAuthAPI,
  checkBackendAvailability,
  getCurrentUser,
  setCurrentUser,
  removeCurrentUser,
  removeToken,
  User,
} from "@/lib/api";

interface AdminContextType {
  isAdminMode: boolean;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const savedUser = getCurrentUser();
        if (savedUser) {
          // Check if backend is available
          const backendAvailable = await checkBackendAvailability();

          if (backendAvailable) {
            // Verify the user is still valid by fetching current profile (admin auth)
            const response = await adminAuthAPI.me();
            // Map admin user to app User shape
            const mapped: User = {
              id: response.user.id,
              email: `${response.user.username}@placeholder.local`,
              username: response.user.username,
              firstName: undefined,
              lastName: undefined,
              userType: response.user.role === "user" ? "END_USER" : "ADMIN",
              role: response.user.role,
              createdAt: response.user.created_at,
              updatedAt: response.user.updated_at,
            };
            setUser(mapped);
            setCurrentUser(mapped);
          } else {
            console.log("Backend not available, using cached user data");
            setUser(savedUser);
          }
        }
      } catch (error) {
        console.log("Auth initialization failed, clearing user data");
        // Token might be expired or backend unavailable, clear it
        removeCurrentUser();
        removeToken();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      setIsLoading(true);

      const backendAvailable = await checkBackendAvailability();

      if (backendAvailable) {
        const resp = await adminAuthAPI.login(username, password);
        const mapped: User = {
          id: resp.user.id,
          email: `${resp.user.username}@placeholder.local`,
          username: resp.user.username,
          firstName: undefined,
          lastName: undefined,
          userType: resp.user.role === "user" ? "END_USER" : "ADMIN",
          role: resp.user.role,
          createdAt: resp.user.created_at,
          updatedAt: resp.user.updated_at,
        };
        setUser(mapped);
        setCurrentUser(mapped);
      } else {
        if (username === "hoang" && password === "Ww123123") {
          const demoUser: User = {
            id: "demo-owner",
            email: "hoang@placeholder.local",
            username: "hoang",
            userType: "ADMIN",
            role: "owner",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as User;
          setUser(demoUser);
          setCurrentUser(demoUser);
        } else {
          throw new Error("Invalid credentials");
        }
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    removeToken();
    removeCurrentUser();
  };

  const refreshProfile = async () => {
    try {
      const resp = await adminAuthAPI.me();
      const mapped: User = {
        id: resp.user.id,
        email: `${resp.user.username}@placeholder.local`,
        username: resp.user.username,
        userType: resp.user.role === "user" ? "END_USER" : "ADMIN",
        role: resp.user.role,
        createdAt: resp.user.created_at,
        updatedAt: resp.user.updated_at,
      } as User;
      setUser(mapped);
      setCurrentUser(mapped);
    } catch (error) {
      console.error("Failed to refresh profile:", error);
      logout();
    }
  };

  const value = {
    isAdminMode: user?.userType === "ADMIN",
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
}
