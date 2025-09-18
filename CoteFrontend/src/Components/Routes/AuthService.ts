/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: "Admin" | "RH" | "Employe";
  isActive: boolean;
  departement?: string;
  matricule?: string;
  employer?: any; // ✅ obligatoire pour correspondre au contexte
}

// Instance axios
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true,
});

// Connexion
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post("/auth/signIn", { email, password });
    const user: User = {
      ...response.data.user,
      employer: response.data.user.employer || {}, // ✅ toujours présent
    };
    return user;
  } catch (error: any) {
    if (error.response?.data?.error) throw new Error(error.response.data.error);
    throw new Error("Erreur de connexion au serveur");
  }
};

// Déconnexion
export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout", {});
  } catch {
    throw new Error("Erreur lors de la déconnexion");
  }
};

// Vérification auth
export const checkAuth = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/check");
    if (!response.data.user) return null;
    return {
      ...response.data.user,
      employer: response.data.user.employer || {},
    };
  } catch {
    return null;
  }
};

// Activer / désactiver utilisateur
export const toggleActiveUser = async (userId: string): Promise<User> => {
  try {
    const res = await api.patch(`/auth/toggle-active/${userId}`);
    return {
      ...res.data.utilisateur,
      employer: res.data.utilisateur.employer || {}, // ✅ pour correspondre au type
    };
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Erreur lors du changement de statut");
  }
};
