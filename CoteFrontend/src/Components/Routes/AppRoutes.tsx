// export default AppRoutes;
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { LoadingSpinner } from "../LoadingSpinner";

// import { AdminDashboard } from "../../roleDashboard/AdminDashboard";
// import { HRDashboard } from "../../roleDashboard/RhDashboard";
import EmployerDashboard from "../../roleDashboard/EmployerDashboard";

import SignIn from "../log/SignIn";
import ForgotPassword from "../log/ForgotPassword";
import ResetPassword from "../log/ResetPassword";
import HomePage from "../../pages/Acceuil";
import CandidatureForm from "../../pages/Candidature";
import CreateRHForm from "../log/SingUp";
import { HRDashboard } from "../../pages/Dashboard";

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

      {/* Auth */}
      <Route path="/login" element={<SignIn />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />

      {/* Création RH - accessible sans authentification ou avec token */}
      <Route path="/signup-rh" element={<CreateRHForm />} />

      {/* Dashboards protégés */}
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["Admin"]}>
            <HRDashboard />
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
            <EmployerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Formulaire de candidature */}
      <Route path="/candidature/:offreId" element={<CandidatureForm />} />

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
