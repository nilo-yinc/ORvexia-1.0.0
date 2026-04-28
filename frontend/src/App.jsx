import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Landing } from './pages/Landing';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { Home } from './pages/Home';
import { Workflows } from './pages/Workflows';
import { WorkflowBuilder } from './pages/WorkflowBuilder';
import { AIBuilder } from './pages/AIBuilder';
import { Analytics } from './pages/Analytics';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';
import { Tables } from './pages/Tables';
import { Forms } from './pages/Forms';
import { Interfaces } from './pages/Interfaces';
import { Transfer } from './pages/Transfer';
import { Apps } from './pages/Apps';
import { Agents } from './pages/Agents';
import { AppLayout } from './layouts/AppLayout';
import AuthCallback from './pages/AuthCallback';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-obsidian">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children, allowAuthenticated = false }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  // If allowAuthenticated is true, show the page even if authenticated
  // Otherwise, redirect authenticated users to home
  if (!allowAuthenticated && isAuthenticated) {
    return <Navigate to="/home" />;
  }
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            {/* Public routes - always accessible */}
            <Route path="/" element={<Landing />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />
            <Route path="/auth-callback" element={<AuthCallback />} />

            {/* Protected routes - require authentication */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="home" element={<Home />} />
              <Route path="workflows" element={<Workflows />} />
              <Route path="ai-builder" element={<AIBuilder />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="templates" element={<Templates />} />
              <Route path="tables" element={<Tables />} />
              <Route path="forms" element={<Forms />} />
              <Route path="interfaces" element={<Interfaces />} />
              <Route path="transfer" element={<Transfer />} />
              <Route path="apps" element={<Apps />} />
              <Route path="agents" element={<Agents />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Workflow Builder routes - Protected but without AppLayout */}
            <Route
              path="workflows/builder"
              element={
                <ProtectedRoute>
                  <WorkflowBuilder />
                </ProtectedRoute>
              }
            />
            <Route
              path="workflows/builder/:id"
              element={
                <ProtectedRoute>
                  <WorkflowBuilder />
                </ProtectedRoute>
              }
            />

            {/* Catch all - redirect to landing */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
