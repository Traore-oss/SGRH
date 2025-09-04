import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  FileText, 
  TrendingUp,
  Target,
  Menu,
  LogOut,
  Crown
} from 'lucide-react';
import { Dashboard } from '../pages/Dashboard';
import { Leaves } from '../pages/Conges';
import { Reports } from '../pages/Rapport';
import { AttendanceManager } from '../pages/Pointages';

type ManagerView = 'dashboard' | 'team' | 'leaves' | 'attendance' | 'reports' | 'performance';

interface ManagerDashboardProps {
  user: { name: string; role: string };
  onLogout: () => void;
}

const managerMenuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: TrendingUp },
  { id: 'team', label: 'Mon Équipe', icon: Users },
  { id: 'leaves', label: 'Congés Équipe', icon: Calendar },
  { id: 'attendance', label: 'Présences', icon: Clock },
  { id: 'performance', label: 'Performance', icon: Target },
  { id: 'reports', label: 'Rapports', icon: FileText },
];

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<ManagerView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'team':
        return <TeamManagement />;
      case 'leaves':
        return <Leaves />;
      case 'attendance':
        return <AttendanceManager />;
      case 'performance':
        return <PerformanceManagement />;
      case 'reports':
        return <Reports />;
      default:
        return <Dashboard />;
    }
  };

  const getViewTitle = () => {
    const titles = {
      dashboard: 'Tableau de Bord Manager',
      team: 'Gestion d\'Équipe',
      leaves: 'Congés de l\'Équipe',
      attendance: 'Présences Équipe',
      performance: 'Performance Équipe',
      reports: 'Rapports Équipe'
    };
    return titles[activeView] || 'Management';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Manager */}
      <div className={`fixed left-0 top-0 h-full bg-purple-600 shadow-lg border-r border-purple-700 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-purple-700 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">MANAGER</h1>
                <p className="text-xs text-purple-200">Gestion d'équipe</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-6">
          {managerMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as ManagerView)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-purple-700 transition-colors ${
                  isActive 
                    ? 'bg-purple-700 text-white border-r-2 border-white' 
                    : 'text-purple-100 hover:text-white'
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
        {/* Header Manager */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-purple-600">
                {getViewTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                Manager: {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-purple-50 px-3 py-1 rounded-full">
                <Crown className="h-4 w-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-600">MANAGER</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
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

// Composant de gestion d'équipe (Manager)
const TeamManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-sm text-gray-500">Membres équipe</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">85%</p>
              <p className="text-sm text-gray-500">Objectifs atteints</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">92%</p>
              <p className="text-sm text-gray-500">Performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Membres de l'Équipe</h3>
        <div className="space-y-4">
          {[
            { name: 'Pierre Martin', role: 'Développeur Senior', status: 'Présent', performance: '95%' },
            { name: 'Marie Dubois', role: 'Chef de Projet', status: 'Présent', performance: '88%' },
            { name: 'Thomas Petit', role: 'Développeur Junior', status: 'Congé', performance: '82%' },
            { name: 'Sophie Bernard', role: 'Designer UX', status: 'Présent', performance: '90%' }
          ].map((member, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 font-semibold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-800">{member.name}</h4>
                  <p className="text-sm text-gray-600">{member.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  member.status === 'Présent' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {member.status}
                </span>
                <span className="text-sm font-medium text-gray-800">{member.performance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Composant de gestion de performance (Manager)
const PerformanceManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Évaluations de Performance</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Pierre Martin</h4>
              <p className="text-sm text-gray-600">Évaluation trimestrielle • Excellente performance</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-green-600">4.8/5</span>
              <button className="bg-green-600 text-white px-3 py-1 rounded-lg text-sm">Voir détails</button>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Marie Dubois</h4>
              <p className="text-sm text-gray-600">Évaluation en cours • Leadership remarquable</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">4.5/5</span>
              <button className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">Compléter</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};