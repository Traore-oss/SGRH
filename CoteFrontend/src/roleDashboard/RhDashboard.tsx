import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  UserPlus,
  Building2,
  Menu,
  LogOut,
  Heart
} from 'lucide-react';
import { Dashboard } from '../pages/Dashboard';
import { Employees } from '../pages/Utilisateur';
import { Leaves } from '../pages/Conges';
import { AttendanceManager } from '../pages/Pointages';
import { Departments } from '../pages/Departement';
import { Reports } from '../pages/Rapport';

type HRView = 'dashboard' | 'employees' | 'leaves' | 'attendance' | 'departments' | 'reports' | 'recruitment';

interface HRDashboardProps {
  user: { name: string; role: string };
  onLogout: () => void;
}

const hrMenuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: Heart },
  { id: 'employees', label: 'Employés', icon: Users },
  { id: 'recruitment', label: 'Recrutement', icon: UserPlus },
  { id: 'leaves', label: 'Congés', icon: Calendar },
  { id: 'attendance', label: 'Présences', icon: Clock },
  { id: 'departments', label: 'Départements', icon: Building2 },
  { id: 'reports', label: 'Rapports RH', icon: FileText },
];

export const HRDashboard: React.FC<HRDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<HRView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
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
        return <Dashboard />;
    }
  };

  const getViewTitle = () => {
    const titles = {
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
      {/* Sidebar RH */}
      <div className={`fixed left-0 top-0 h-full bg-green-600 shadow-lg border-r border-green-700 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
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
        </div>

        <nav className="mt-6">
          {hrMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as HRView)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-green-700 transition-colors ${
                  isActive 
                    ? 'bg-green-700 text-white border-r-2 border-white' 
                    : 'text-green-100 hover:text-white'
                }`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header RH */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-green-600">
                {getViewTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                RH: {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-1 rounded-full">
                <Heart className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">RH</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {renderView()}
        </div>
      </main>
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