import api from "../api/axios.config";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: string;
  isActive: boolean;
  departement?: string;
}

// Connexion
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const res = await api.post("/auth/signIn", { email, password });
    return res.data.user; // retourne l'objet utilisateur
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Erreur serveur");
  }
};

// Déconnexion
export const logout = async (): Promise<void> => {
  try {
    await api.post("/auth/logout");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw new Error("Erreur lors de la déconnexion");
  }
};

// Vérification auth (récupère l'utilisateur connecté)
export const checkAuth = async (): Promise<User | null> => {
  try {
    const res = await api.get("/auth/check");
    return res.data.user || null;
  } catch {
    return null;
  }
};
