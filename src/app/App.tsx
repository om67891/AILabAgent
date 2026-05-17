import { lazy, Suspense, type ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from './components/ui/sonner';
import { ErrorBoundary } from './components/system/ErrorBoundary';
import { useSupabaseSession } from './hooks/useSupabaseSession';

const Signup = lazy(() => import('./pages/Signup').then((module) => ({ default: module.Signup })));
const Login = lazy(() => import('./pages/Login').then((module) => ({ default: module.Login })));
const FacultyDashboard = lazy(() => import('./pages/FacultyDashboard').then((module) => ({ default: module.FacultyDashboard })));
const StudentDashboard = lazy(() => import('./pages/StudentDashboard').then((module) => ({ default: module.StudentDashboard })));
const StudentLabPage = lazy(() => import('./pages/StudentLabPage').then((module) => ({ default: module.StudentLabPage })));
const CreateLab = lazy(() => import('./pages/CreateLab').then((module) => ({ default: module.CreateLab })));
const FacultyLabPage = lazy(() => import('./pages/FacultyLabPage').then((module) => ({ default: module.FacultyLabPage })));
const AddExperiment = lazy(() => import('./pages/AddExperiment').then((module) => ({ default: module.AddExperiment })));
const CodeWorkspace = lazy(() => import('./pages/CodeWorkspace').then((module) => ({ default: module.CodeWorkspace })));
const NonCodeWorkspace = lazy(() => import('./pages/NonCodeWorkspace').then((module) => ({ default: module.NonCodeWorkspace })));
const Profile = lazy(() => import('./pages/Profile').then((module) => ({ default: module.Profile })));
const Settings = lazy(() => import('./pages/Settings').then((module) => ({ default: module.Settings })));
const LabHistory = lazy(() => import('./pages/LabHistory').then((module) => ({ default: module.LabHistory })));

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />

              {/* Faculty Routes */}
              <Route path="/dashboard" element={<ProtectedRoute><FacultyDashboard /></ProtectedRoute>} />
              <Route path="/create-lab" element={<ProtectedRoute><CreateLab /></ProtectedRoute>} />
              <Route path="/teacher/lab/:labId" element={<ProtectedRoute><FacultyLabPage /></ProtectedRoute>} />
              <Route path="/teacher/lab/:labId/add-exp" element={<ProtectedRoute><AddExperiment /></ProtectedRoute>} />
              <Route path="/teacher/lab/:labId/add-experiment" element={<ProtectedRoute><AddExperiment /></ProtectedRoute>} />

              {/* Student Routes */}
              <Route path="/student/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
              <Route path="/student/lab/:labId" element={<ProtectedRoute><StudentLabPage /></ProtectedRoute>} />
              <Route path="/student/lab/:labId/experiment/:experimentId" element={<ProtectedRoute><CodeWorkspace /></ProtectedRoute>} />
              <Route path="/student/lab/:labId/non-code/:experimentId" element={<ProtectedRoute><NonCodeWorkspace /></ProtectedRoute>} />

              {/* Workspace Routes */}
              <Route path="/workspace/code/:experimentId" element={<ProtectedRoute><CodeWorkspace /></ProtectedRoute>} />
              <Route path="/workspace/non-code/:experimentId" element={<ProtectedRoute><NonCodeWorkspace /></ProtectedRoute>} />

              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/lab-history" element={<ProtectedRoute><LabHistory /></ProtectedRoute>} />
              <Route path="/history" element={<Navigate to="/lab-history" replace />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Toaster position="top-right" richColors />
      </div>
    </BrowserRouter>
  );
}

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isLoading, userId, isConfigured } = useSupabaseSession();

  if (!isConfigured) return <>{children}</>;
  if (isLoading) return <RouteFallback />;
  if (!userId) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="rounded-2xl border border-border bg-card px-6 py-5 shadow-2xl">
        <div className="mb-3 h-2 w-48 overflow-hidden rounded-full bg-muted">
          <div className="h-full w-1/2 animate-pulse rounded-full bg-gradient-to-r from-primary to-accent" />
        </div>
        <p className="text-sm text-muted-foreground">Loading AILabAgent workspace...</p>
      </div>
    </div>
  );
}
