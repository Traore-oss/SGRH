// src/components/ProtectedRoute.tsx
import React, { type JSX } from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token'); // ou utilise un context/global state

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};
