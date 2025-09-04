/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response: any) => response,
  (error: any) => {
    if (error.response?.status === 401) {
      // Rediriger vers la page de login si non authentifié
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;