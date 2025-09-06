// import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  UserPlus,
  Building2,
  Menu,
  LogOut,
  Heart,
  BarChart3,
  Settings,
  Eye,
  Edit,
  Filter,
  Search,
  X,
  Plus,
  User as UserIcon,
  Bell,
  ChevronDown
} from 'lucide-react';
import { Dashboard } from '../pages/Dashboard';
import { Employees } from '../pages/Utilisateur';
import { Leaves } from '../pages/Conges';
import { AttendanceManager } from '../pages/Pointages';
import { Departments } from '../pages/Departement';
import { Reports } from '../pages/Rapport';
import { useAuth } from '../context/AuthContext';
import { getEmployees, type Employee } from '../Components/ServiceEmployer';
import { EmployeeForm } from '../forms/EmployeeForm';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';
import { useEffect, useState } from 'react';

type HRView = 'dashboard' | 'employees' | 'leaves' | 'attendance' | 'departments' | 'reports' | 'recruitment';

interface UserProfile {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  genre: string;
  date_naissance: string;
  poste: string;
  departement?: {
    _id: string;
    nom: string;
    code_departement: string;
  };
  salaire: number;
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  role: string;
  statut: 'Actif' | 'Inactif' | 'Suspendu';
  isActive: boolean;
  date_embauche: string;
  photo?: string;
}

// ==================== Modal amélioré ====================
interface ModalProps {
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const Modal: React.FC<ModalProps> = ({ onClose, title, children, size = 'md' }) => {
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex justify-between items-center rounded-t-xl">
          {title && <h2 className="text-xl font-semibold text-gray-800">{title}</h2>}
          <button 
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            onClick={onClose}
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

// ==================== Cartes de Statistiques ====================
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% depuis le mois dernier
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>
        {icon}
      </div>
    </div>
  </div>
);

// Composant pour afficher une information de manière standardisée
const InfoItem: React.FC<{ label: string; value: React.ReactNode; isFullWidth?: boolean }> = ({ 
  label, 
  value, 
  isFullWidth = false 
}) => (
  <div className={isFullWidth ? "col-span-2" : ""}>
    <div className="text-xs text-gray-500 uppercase font-medium mb-1">{label}</div>
    <div className="text-sm font-medium text-gray-900">
      {value || <span className="text-gray-400">Non renseigné</span>}
    </div>
  </div>
);

// Calcul de l'ancienneté
const calculateSeniority = (hireDate: string) => {
  try {
    const now = new Date();
    const hire = new Date(hireDate);
    const diffYears = now.getFullYear() - hire.getFullYear();
    const diffMonths = now.getMonth() - hire.getMonth();
    
    if (diffMonths < 0) {
      return `${diffYears - 1} an(s) et ${12 + diffMonths} mois`;
    }
    return `${diffYears} an(s) et ${diffMonths} mois`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return 'Date invalide';
  }
};

const hrMenuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
  { id: 'employees', label: 'Employés', icon: Users },
  { id: 'recruitment', label: 'Recrutement', icon: UserPlus },
  { id: 'leaves', label: 'Congés', icon: Calendar },
  { id: 'attendance', label: 'Présences', icon: Clock },
  { id: 'departments', label: 'Départements', icon: Building2 },
  { id: 'reports', label: 'Rapports RH', icon: FileText },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const HRDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<HRView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer le profil de l'utilisateur connecté
  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Essayer différents endpoints possibles
      const endpoints = [
        `${API_BASE}/api/Users/getMyProfile`,
        `${API_BASE}/api/Users/me`,
        `${API_BASE}/api/Users/profile`,
        `${API_BASE}/api/auth/me`,
        `${API_BASE}/api/auth/profile`
      ];

      let response = null;
      let lastError = null;

      // Essayer chaque endpoint jusqu'à ce qu'un fonctionne
      for (const endpoint of endpoints) {
        try {
          response = await fetch(endpoint, {
            method: 'GET',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (response.ok) {
            const data = await response.json();
            setUserProfile(data);
            return; // Sortir si réussite
          }
        } catch (error) {
          lastError = error;
          continue; // Essayer le prochain endpoint
        }
      }

      // Si aucun endpoint n'a fonctionné, essayer de récupérer tous les employés et filtrer
      try {
        const allEmployeesResponse = await fetch(`${API_BASE}/api/Users/getAllEmployees`, {
          credentials: 'include',
        });

        if (allEmployeesResponse.ok) {
          const allEmployees = await allEmployeesResponse.json();
          // Trouver l'utilisateur actuel basé sur l'email ou d'autres critères
          const currentUser = allEmployees.find((emp: any) => 
            emp.email === user?.name || emp.nom === user?.name
          );
          
          if (currentUser) {
            setUserProfile(currentUser);
            return;
          }
        }
      } catch (error) {
        console.error('Erreur avec getAllEmployees:', error);
      }

      throw new Error('Impossible de récupérer le profil utilisateur');

    } catch (error) {
      console.error('Erreur:', error);
      // Créer un profil mocké pour le développement
      const mockProfile: UserProfile = {
        _id: '1',
        matricule: 'RH001',
        nom: 'Dupont',
        prenom: 'Marie',
        email: 'marie.dupont@company.com',
        telephone: '+33 1 23 45 67 89',
        adresse: '456 Avenue des RH, 75000 Paris',
        genre: 'Féminin',
        date_naissance: '1985-08-20',
        poste: 'Responsable RH',
        departement: {
          _id: '1',
          nom: 'Ressources Humaines',
          code_departement: 'RH'
        },
        salaire: 4500,
        typeContrat: 'CDI',
        role: 'rh',
        statut: 'Actif',
        isActive: true,
        date_embauche: '2020-01-15'
      };
      setUserProfile(mockProfile);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard userProfile={userProfile} />;
      case 'employees':
        return <Employees />;
      case 'leaves':
        return <Leaves />;
      case 'attendance':
        return <AttendanceManager />;
      case 'departments':
        return <Departments />;
      case 'reports':
        return <Reports />;
      case 'recruitment':
        return <RecruitmentManagement />;
      default:
        return <Dashboard userProfile={userProfile} />;
    }
  };

  const getViewTitle = (): string => {
    const titles: Record<HRView, string> = {
      dashboard: 'Tableau de Bord RH',
      employees: 'Gestion des Employés',
      recruitment: 'Gestion du Recrutement',
      leaves: 'Validation des Congés',
      attendance: 'Suivi des Présences',
      departments: 'Organisation',
      reports: 'Rapports RH'
    };
    return titles[activeView] || 'Ressources Humaines';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
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
      
      {/* Sidebar pour desktop */}
      <div className={`hidden md:flex fixed left-0 top-0 h-full bg-green-600 shadow-lg border-r border-green-700 z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center space-x-3">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              className="p-2 hover:bg-green-700 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">RH</h1>
                <p className="text-xs text-green-200">Ressources Humaines</p>
              </div>
            )}
          </div>
          <nav className="mt-6 flex-1">
            {hrMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as HRView);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-green-700 text-white font-medium' : 'text-green-100 hover:bg-green-700'}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-green-700">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center space-x-3 px-4 py-3 text-green-100 hover:bg-green-700 rounded-lg transition-colors"
            >
              <LogOut className="h-5 w-5" />
              {!sidebarCollapsed && <span>Déconnexion</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Menu mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed left-0 top-0 h-full bg-green-600 w-64 shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-green-700">
              <div>
                <h1 className="text-xl font-bold text-white">RH</h1>
                <p className="text-xs text-green-200">Ressources Humaines</p>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X className="h-5 w-5 text-white" />
              </button>
            </div>
            <nav className="mt-6">
              {hrMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as HRView);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-green-700 text-white font-medium' : 'text-green-100 hover:bg-green-700'}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t border-green-700">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center space-x-3 px-4 py-3 text-green-100 hover:bg-green-700 rounded-lg transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Header amélioré avec photo utilisateur */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex justify-between items-center z-30">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
            >
              <Menu className="h-5 w-5 text-gray-800" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800">{getViewTitle()}</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {userProfile?.prenom?.[0]}{userProfile?.nom?.[0]}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {userProfile?.prenom} {userProfile?.nom}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {userProfile?.poste}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 md:p-6">
          {renderView()}
        </div>
      </div>
    </div>
  );
};

// Composant de gestion du recrutement (RH)
const RecruitmentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-sm text-gray-500">Offres actives</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">45</p>
              <p className="text-sm text-gray-500">Candidatures</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">8</p>
              <p className="text-sm text-gray-500">Entretiens</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">3</p>
              <p className="text-sm text-gray-500">Embauches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Processus de Recrutement</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Développeur Full Stack</h4>
              <p className="text-sm text-gray-600">15 candidatures • 3 entretiens planifiés</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Gérer
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Assistant RH</h4>
              <p className="text-sm text-gray-600">8 candidatures • 2 entretiens terminés</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Gérer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};