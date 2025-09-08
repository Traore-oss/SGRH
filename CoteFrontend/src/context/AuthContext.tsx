import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface User {
  matricule: string;
  departement: any;
  _id: string;
  email: string;
  nom: string;
  prenom: string;
  role: string;
  isActive: boolean;
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
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  activityHistory: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/check', {
        withCredentials: true,
      });
      setUser(response.data.user);
      
      // Charger l'historique des activités depuis le localStorage
      if (response.data.user) {
        const savedActivities = localStorage.getItem(`userActivities_${response.data.user._id}`);
        if (savedActivities) {
          setActivityHistory(JSON.parse(savedActivities));
        }
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };
  

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post('http://localhost:8000/api/auth/signIn', {
        email,
        password,
      }, {
        withCredentials: true,
      });
      
      setUser(response.data.user);
      
      // Ajouter une activité de connexion
      addActivity({
        type: 'auth',
        description: 'Connexion au système',
        userId: response.data.user._id
      });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Erreur de connexion');
    }
  };

  const logout = async () => {
    try {
      // Ajouter une activité de déconnexion
      if (user) {
        addActivity({
          type: 'auth',
          description: 'Déconnexion du système',
          userId: user._id
        });
      }
      
      await axios.post('http://localhost:8000/api/auth/logout', {}, {
        withCredentials: true,
      });
      setUser(null);
      setActivityHistory([]);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const addActivity = (activity: Omit<Activity, 'id' | 'timestamp'>) => {
    const newActivity: Activity = {
      ...activity,
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date()
    };
    
    setActivityHistory(prev => {
      const updatedHistory = [newActivity, ...prev].slice(0, 50); // Garder les 50 dernières activités
      
      // Sauvegarder dans le localStorage
      if (user) {
        localStorage.setItem(`userActivities_${user._id}`, JSON.stringify(updatedHistory));
      }
      
      return updatedHistory;
    });
  };

  const value = {
    user,
    login,
    logout,
    loading,
    activityHistory,
    addActivity
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};