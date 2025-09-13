import api from "../api/axios.config";

export interface User {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "Admin" | "RH" | "Employe";
  isActive: boolean;
  departement?: string;
  entreprise?: string;
  matricule?: string; 
}

// Connexion
export const login = async (email: string, password: string): Promise<User> => {
  try {
    const res = await api.post("/Auth/login", { email, password });
    return res.data.user;
  } catch (err: any) {
    throw new Error(err.response?.data?.error || "Erreur serveur");
  }
};

// Déconnexion
export const logout = async (): Promise<void> => {
  try {
    await api.get("/Auth/logout");
  } catch {
    throw new Error("Erreur lors de la déconnexion");
  }
};

// Récupérer l'utilisateur connecté
export const checkAuth = async () => {
  try {
    const res = await api.get("/Auth/check");
    return res.data.user || null;
  } catch {
    return null;
  }
};


// Activer / désactiver un utilisateur
export const toggleActiveUser = async (userId: string): Promise<User> => {
  try {
    const res = await api.patch(`/auth/toggleActive/${userId}`);
    return res.data.utilisateur;
  } catch (err: any) {
    throw new Error(err.response?.data?.message || "Erreur lors du changement de statut");
  }
};
