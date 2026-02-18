import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<string | null>;
  signup: (
    name: string,
    email: string,
    password: string,
  ) => Promise<string | null>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem("token"),
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuthenticated = !!token;

  // Configure Axios defaults
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }

  useEffect(() => {
    checkAuth();
  }, [token]);

  async function checkAuth() {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await axios.get("/auth/me");
      setUser(res.data.user);
    } catch (error) {
      console.error("Token verification failed", error);
      logout();
    } finally {
      setIsLoading(false);
    }
  }

  async function login(
    email: string,
    password: string,
  ): Promise<string | null> {
    setIsLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });
      const newToken = res.data.token;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(res.data.user);
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return error.response?.data?.error || "Login failed";
      }
      return "An unexpected error occurred";
    } finally {
      setIsLoading(false);
    }
  }

  async function signup(
    name: string,
    email: string,
    password: string,
  ): Promise<string | null> {
    setIsLoading(true);
    try {
      const res = await axios.post("/auth/signup", { name, email, password });
      const newToken = res.data.token;

      localStorage.setItem("token", newToken);
      setToken(newToken);
      setUser(res.data.user);
      return null;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return error.response?.data?.error || "Signup failed";
      }
      return "An unexpected error occurred";
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common["Authorization"];
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
