import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../LoadingSpinner";

import { AdminDashboard } from "../../roleDashboard/AdminDashboard";
import { HRDashboard } from "../../roleDashboard/RhDashboard";
import { EmployeeDashboard } from "../../roleDashboard/EmployerDashboard";
import SignIn from "../log/SignIn";
import HomePage from "../../pages/Acceuil";

// Route protégée par rôle
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles: string[] }> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/unauthorized" replace />;

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Redirection de la racine */}
      <Route path="/" element={<HomePage />} />

      {/* Login */}
      <Route path="/login" element={<SignIn />} />

      {/* Dashboards protégés */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/hr-dashboard"
        element={
          <ProtectedRoute allowedRoles={["RH"]}>
            <HRDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/employee-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Employe"]}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      {/* Page accès non autorisé */}
      <Route
        path="/unauthorized"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-red-600">Accès non autorisé</h1>
              <p className="text-gray-600">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
            </div>
          </div>
        }
      />

      {/* 404 */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold">404 - Page introuvable</h1>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
