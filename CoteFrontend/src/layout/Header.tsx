import React from 'react';
import { Bell, Search, Settings, User } from 'lucide-react';

interface HeaderProps {
  activeView: string;
  onToggleSidebar?: () => void;
  onLogout: () => void; // 🔹 Ajout de la prop
}

const viewTitles: Record<string, string> = {
  dashboard: 'Tableau de Bord',
  employees: 'Gestion des Employés',
  leaves: 'Gestion des Congés',
  attendance: 'Gestion des Présences',
  departments: 'Gestion des Départements',
  reports: 'Rapports et Statistiques',
  training: 'Formations',
  performance: 'Évaluations',
  recruitment: 'Recrutement'
};

export const Header: React.FC<HeaderProps> = ({ activeView, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">
            {viewTitles[activeView] || 'SGRH'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Gérez efficacement vos ressources humaines
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
            />
          </div>

          <button className="relative p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
          </button>

          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="h-5 w-5" />
          </button>

          {/* Profil + déconnexion */}
          <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-800">Admin RH</p>
              <p className="text-xs text-gray-500">Administrateur</p>
            </div>
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <button
              onClick={onLogout}
              className="ml-4 bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
