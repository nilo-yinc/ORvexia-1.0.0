import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

const Landing = lazy(() => import('./pages/Landing').then((module) => ({ default: module.Landing })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const Signup = lazy(() => import('./pages/Signup').then((module) => ({ default: module.Signup })));
const Home = lazy(() => import('./pages/Home').then((module) => ({ default: module.Home })));
const Workflows = lazy(() => import('./pages/Workflows').then((module) => ({ default: module.Workflows })));
const WorkflowBuilder = lazy(() => import('./pages/WorkflowBuilder').then((module) => ({ default: module.WorkflowBuilder })));
const AIBuilder = lazy(() => import('./pages/AIBuilder').then((module) => ({ default: module.AIBuilder })));
const Analytics = lazy(() => import('./pages/Analytics').then((module) => ({ default: module.Analytics })));
const Templates = lazy(() => import('./pages/Templates').then((module) => ({ default: module.Templates })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const Tables = lazy(() => import('./pages/Tables').then((module) => ({ default: module.Tables })));
const Forms = lazy(() => import('./pages/Forms').then((module) => ({ default: module.Forms })));
const Interfaces = lazy(() => import('./pages/Interfaces').then((module) => ({ default: module.Interfaces })));
const Transfer = lazy(() => import('./pages/Transfer').then((module) => ({ default: module.Transfer })));
const Apps = lazy(() => import('./pages/Apps').then((module) => ({ default: module.Apps })));
const Agents = lazy(() => import('./pages/Agents').then((module) => ({ default: module.Agents })));
const AppLayout = lazy(() => import('./layouts/AppLayout').then((module) => ({ default: module.AppLayout })));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-obsidian">
    <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
  </div>
);

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
          <Suspense fallback={<LoadingScreen />}>
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
          </Suspense>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
