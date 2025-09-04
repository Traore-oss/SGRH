import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoadingSpinner } from "../LoadingSpinner";
import { useAuth } from "../../context/AuthContext";
import { LoginPage } from "../log/Login";
import { AdminDashboard } from "../../roleDashboard/AdminDashboard";
import { ManagerDashboard } from "../../roleDashboard/ManagerDashboard";
import { EmployeeDashboard } from "../../roleDashboard/EmployerDashboard";
import { HRDashboard } from "../../roleDashboard/RhDashboard";

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <LoadingSpinner />;
  if (user) {
    switch (user.role) {
      case "Admin": return <Navigate to="/admin-dashboard" replace />;
      case "Manager": return <Navigate to="/manager-dashboard" replace />;
      case "rh": return <Navigate to="/hr-dashboard" replace />;
      case "Employer": return <Navigate to="/employee-dashboard" replace />;
      default: return <Navigate to="/login" replace />;
    }
  }
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { logout } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

        <Route path="/admin-dashboard/*" element={
          <ProtectedRoute allowedRoles={['Admin']}>
            <AdminDashboard onLogout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/manager-dashboard/*" element={
          <ProtectedRoute allowedRoles={['Manager']}>
            <ManagerDashboard onLogout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/hr-dashboard/*" element={
          <ProtectedRoute allowedRoles={['rh']}>
            <HRDashboard onLogout={logout} />
          </ProtectedRoute>
        } />
        <Route path="/employee-dashboard/*" element={
          <ProtectedRoute allowedRoles={['Employer']}>
            <EmployeeDashboard onLogout={logout} />
          </ProtectedRoute>
        } />

        <Route path="/unauthorized"  element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Accès non autorisé</h1>
              <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            </div>
          </div>
        } />

        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">404 - Page introuvable</h1>
            </div>
          </div>
        } />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
