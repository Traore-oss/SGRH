import axios from "axios";

export interface User {
  id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  departement?: string;
  isActive: boolean;
}

// Instance axios
const api = axios.create({
  baseURL: "http://localhost:8000/api",
  withCredentials: true, // 🔹 important pour JWT
});

// Connexion
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const response = await api.post("/auth/signIn", { email, password });
    if (response.data.user) return response.data.user;
    throw new Error("Réponse du serveur invalide");
  } catch (error: any) {
    if (error.response?.data?.error) throw new Error(error.response.data.error);
    throw new Error("Erreur de connexion au serveur");
  }
};

// Déconnexion
export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout", {});
  } catch  {
    throw new Error("Erreur lors de la déconnexion");
  }
};

// Vérification auth
export const checkAuth = async (): Promise<User | null> => {
  try {
    const response = await api.get("/auth/check");
    return response.data.user || null;
  } catch {
    return null;
  }
};
