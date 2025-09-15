/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import * as authService from "../service/AuthService"; // <-- ton fichier service

export interface User {
  employer: any;
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

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
  toggleActiveUser: (userId: string) => Promise<User>;
  loading: boolean;
  activityHistory: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "timestamp">) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activityHistory, setActivityHistory] = useState<Activity[]>([]);

  useEffect(() => {
    // 🔹 Vérifie d'abord dans localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setLoading(false);
      return;
    }

    // 🔹 Sinon, appelle l’API
    const checkUser = async () => {
      try {
        const res = await authService.checkAuth();
        setUser(res);
        localStorage.setItem("user", JSON.stringify(res)); // 🔹 Sauvegarde en local
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const login = async (email: string, password: string) => {
    const loggedUser = await authService.login(email, password);
    setUser(loggedUser);

    // 🔹 Sauvegarde dans localStorage
    localStorage.setItem("user", JSON.stringify(loggedUser));

    addActivity({
      type: "auth",
      description: "Connexion au système",
      userId: loggedUser.id,
    });

    return loggedUser;
  };

  const logout = async () => {
    await authService.logout();
    if (user) {
      addActivity({
        type: "auth",
        description: "Déconnexion du système",
        userId: user.id,
      });
    }
    setUser(null);
    setActivityHistory([]);
    localStorage.removeItem("user"); // 🔹 Supprime du stockage
  };

  const toggleActiveUser = async (userId: string) => {
    const updatedUser = await authService.toggleActiveUser(userId);

    addActivity({
      type: "user",
      description: `Utilisateur ${updatedUser.nom} ${updatedUser.prenom} ${
        updatedUser.isActive ? "activé" : "désactivé"
      }`,
      userId: updatedUser.id,
    });

    // Met à jour l'utilisateur courant si c'est lui-même
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser)); // 🔹 Mise à jour stockage
    }

    return updatedUser;
  };

  const addActivity = (activity: Omit<Activity, "id" | "timestamp">) => {
    const newActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setActivityHistory((prev) => {
      const updatedHistory = [newActivity, ...prev].slice(0, 50);
      if (user) localStorage.setItem(`userActivities_${user.id}`, JSON.stringify(updatedHistory));
      return updatedHistory;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, toggleActiveUser, loading, activityHistory, addActivity }}>
      {children}
    </AuthContext.Provider>
  );
};
