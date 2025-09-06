import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { Login } from './Components/log/Login';
import { AdminDashboard } from './roleDashboard/AdminDashboard';
import { HRDashboard } from './roleDashboard/RhDashboard';
import { ManagerDashboard } from './roleDashboard/ManagerDashboard';
import { EmployeeDashboard } from './roleDashboard/EmployerDashboard';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Toujours démarrer sur le Login */}
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />

      {/* Routes protégées par rôle */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={['Admin', 'admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/rh/"
        element={
          <ProtectedRoute allowedRoles={['RH', 'rh']}>
            <HRDashboard user={{
              name: '',
              role: ''
            }} onLogout={function (): void {
              throw new Error('Function not implemented.');
            } } />
          </ProtectedRoute>
        }
      />
      <Route
        path="/manager/"
        element={
          <ProtectedRoute allowedRoles={['Manager', 'manager']}>
            <ManagerDashboard user={{
              name: '',
              role: ''
            }} onLogout={function (): void {
              throw new Error('Function not implemented.');
            } } />
          </ProtectedRoute>
        }
      />
      <Route
      path="/employee/"
      element={
      <ProtectedRoute allowedRoles={['Employer', 'employé', 'Employee', 'employee']}>
      <EmployeeDashboard user={{
            name: '',
            role: ''
          }} onLogout={function (): void {
            throw new Error('Function not implemented.');
          } } />
      </ProtectedRoute>
      }
      />

      {/* Page non autorisée */}
      <Route path="/unauthorized" element={<div className="text-center mt-10 text-red-600 font-bold">Accès non autorisé</div>} />

      {/* Redirection vers dashboard selon rôle après login */}
      <Route
      path="/dashboard"
      element={
      <ProtectedRoute>
      {user?.role === 'Admin' ? <Navigate to="/admin" /> :
      user?.role === 'rh' ? <Navigate to="/rh" /> :
      user?.role === 'Manager' ? <Navigate to="/manager" /> :
      <Navigate to="/employee" />}
      </ProtectedRoute>
      }
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
