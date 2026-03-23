import { useState, useEffect, createContext, useContext } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "./components/ui/sonner";
import { toast } from "sonner";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InvitePartner from "./pages/InvitePartner";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import WeeklyPlan from "./pages/WeeklyPlan";
import Progress from "./pages/Progress";
import Settings from "./pages/Settings";
import DailyLog from "./pages/DailyLog";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

// Auth Context
const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [couple, setCouple] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const api = axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const register = async (name, email, password) => {
    const response = await api.post("/auth/register", { name, email, password });
    const { access_token, user: userData } = response.data;
    localStorage.setItem("token", access_token);
    setToken(access_token);
    setUser(userData);
    return userData;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setCouple(null);
  };

  const fetchUser = async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const response = await api.get("/auth/me");
      setUser(response.data);
      
      // Fetch couple data if paired
      if (response.data.couple_id) {
        const coupleResponse = await api.get("/couple");
        setCouple(coupleResponse.data);
      }
    } catch (error) {
      console.error("Auth error:", error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const refreshCouple = async () => {
    try {
      const response = await api.get("/couple");
      setCouple(response.data);
    } catch (error) {
      console.error("Error fetching couple:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [token]);

  const value = {
    user,
    couple,
    token,
    loading,
    login,
    register,
    logout,
    api,
    refreshCouple,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Protected Route
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse-soft text-primary text-xl font-heading">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Layout with Navigation
const AppLayout = ({ children }) => {
  const { user, couple } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!user) return children;

  const navItems = [
    { path: "/dashboard", icon: "home", label: "Home" },
    { path: "/plan", icon: "calendar", label: "Plan" },
    { path: "/log", icon: "edit", label: "Log" },
    { path: "/progress", icon: "chart", label: "Progress" },
    { path: "/settings", icon: "settings", label: "Settings" },
  ];

  const getIcon = (icon) => {
    const icons = {
      home: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      calendar: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      edit: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      chart: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      settings: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    };
    return icons[icon] || icons.home;
  };

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-0">
      {children}
      
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-6 left-6 right-6 bg-stone-900/95 backdrop-blur-lg text-white rounded-full p-2 flex justify-around items-center shadow-2xl z-50 md:hidden">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            data-testid={`nav-${item.icon}`}
            className={`p-3 rounded-full transition-all ${
              location.pathname === item.path
                ? "bg-primary text-white"
                : "text-stone-400 hover:text-white"
            }`}
          >
            {getIcon(item.icon)}
          </button>
        ))}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full w-20 bg-white border-r border-stone-100 flex-col items-center py-8 z-40">
        <div className="text-2xl font-heading font-bold text-primary mb-12">R</div>
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            data-testid={`nav-desktop-${item.icon}`}
            className={`p-3 rounded-2xl mb-2 transition-all ${
              location.pathname === item.path
                ? "bg-primary text-white"
                : "text-stone-400 hover:text-stone-900 hover:bg-stone-50"
            }`}
            title={item.label}
          >
            {getIcon(item.icon)}
          </button>
        ))}
      </aside>
    </div>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/invite"
            element={
              <ProtectedRoute>
                <InvitePartner />
              </ProtectedRoute>
            }
          />
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Dashboard />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/plan"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <WeeklyPlan />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/log"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <DailyLog />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/progress"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Progress />
                </AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout>
                  <Settings />
                </AppLayout>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
