// import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Target,
  Award,
  Menu,
  LogOut,
  Briefcase
} from 'lucide-react';
import { useState } from 'react';

type EmployeeView = 'dashboard' | 'profile' | 'leaves' | 'attendance' | 'goals' | 'payslips';

interface UserProfile {
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
  hireDate: string;
  manager: string;
}

interface EmployeeDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

const employeeMenuItems = [
  { id: 'dashboard', label: 'Mon Tableau de Bord', icon: Briefcase },
  { id: 'profile', label: 'Mon Profil', icon: User },
  { id: 'leaves', label: 'Mes Congés', icon: Calendar },
  { id: 'attendance', label: 'Mes Présences', icon: Clock },
  { id: 'goals', label: 'Mes Objectifs', icon: Target },
  { id: 'payslips', label: 'Bulletins de Paie', icon: FileText },
];

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ user, onLogout }) => {
  const [activeView, setActiveView] = useState<EmployeeView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <EmployeeOverview />;
      case 'profile':
        return <EmployeeProfile user={user} />;
      case 'leaves':
        return <EmployeeLeaves />;
      case 'attendance':
        return <EmployeeAttendance />;
      case 'goals':
        return <EmployeeGoals />;
      case 'payslips':
        return <EmployeePayslips />;
      default:
        return <EmployeeOverview />;
    }
  };

  const getViewTitle = () => {
    const titles = {
      dashboard: 'Mon Espace Personnel',
      profile: 'Mon Profil',
      leaves: 'Mes Demandes de Congé',
      attendance: 'Mes Présences',
      goals: 'Mes Objectifs',
      payslips: 'Mes Bulletins de Paie'
    };
    return titles[activeView] || 'Mon Espace';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Employé */}
      <div className={`fixed left-0 top-0 h-full bg-blue-600 shadow-lg border-r border-blue-700 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-white" />
            </button>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-white">MON ESPACE</h1>
                <p className="text-xs text-blue-200">Employé</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-6">
          {employeeMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as EmployeeView)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-blue-700 transition-colors ${
                  isActive 
                    ? 'bg-blue-700 text-white border-r-2 border-white' 
                    : 'text-blue-100 hover:text-white'
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
        {/* Header Employé */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-blue-600">
                {getViewTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                Bonjour, {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1 rounded-full">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-600">EMPLOYÉ</span>
              </div>
              <button
                onClick={onLogout}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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

// Vue d'ensemble employé
const EmployeeOverview: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">18</p>
              <p className="text-sm text-gray-500">Jours de congé</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">8h15</p>
              <p className="text-sm text-gray-500">Heures aujourd'hui</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">75%</p>
              <p className="text-sm text-gray-500">Objectifs</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500">
              <Award className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">4.2/5</p>
              <p className="text-sm text-gray-500">Performance</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-left">
            <Calendar className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-800">Demander un congé</h4>
            <p className="text-sm text-gray-600">Nouvelle demande de congé</p>
          </button>
          <button className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-left">
            <Clock className="h-8 w-8 text-blue-600 mb-2" />
            <h4 className="font-medium text-gray-800">Pointer</h4>
            <p className="text-sm text-gray-600">Enregistrer présence</p>
          </button>
          <button className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-left">
            <FileText className="h-8 w-8 text-purple-600 mb-2" />
            <h4 className="font-medium text-gray-800">Mes bulletins</h4>
            <p className="text-sm text-gray-600">Consulter mes fiches de paie</p>
          </button>
        </div>
      </div>
    </div>
  );
};

// Profil employé avec user dynamique
interface EmployeeProfileProps {
  user: UserProfile;
}

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ user }) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Informations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <p className="text-gray-800">{user.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-800">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
            <p className="text-gray-800">{user.position}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
            <p className="text-gray-800">{user.department}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date d'embauche</label>
            <p className="text-gray-800">{user.hireDate}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <p className="text-gray-800">{user.manager}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Les autres composants restent inchangés

const EmployeeLeaves: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Mes Demandes de Congé</h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Nouvelle demande
          </button>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Congés d'été</h4>
              <p className="text-sm text-gray-600">15 juillet - 29 juillet 2024 • 11 jours</p>
            </div>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
              En attente
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Congé maladie</h4>
              <p className="text-sm text-gray-600">10 juin - 12 juin 2024 • 3 jours</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              Approuvé
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeAttendance: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Présences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <Clock className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-800">Pointer l'arrivée</h4>
            <p className="text-sm text-gray-600">08:15 aujourd'hui</p>
          </button>
          <button className="p-4 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
            <Clock className="h-8 w-8 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-800">Pointer le départ</h4>
            <p className="text-sm text-gray-600">Non pointé</p>
          </button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Aujourd'hui</span>
            <span className="text-sm font-medium text-gray-800">08:15 - En cours</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm text-gray-600">Hier</span>
            <span className="text-sm font-medium text-gray-800">08:00 - 17:00 (8h00)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeGoals: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Objectifs</h3>
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Certification React</h4>
              <span className="text-sm text-blue-600 font-medium">75%</span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Échéance: 31 décembre 2024</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-800">Projet E-commerce</h4>
              <span className="text-sm text-green-600 font-medium">90%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Échéance: 15 septembre 2024</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeePayslips: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Bulletins de Paie</h3>
        <div className="space-y-3">
          {[
            { month: 'Juin 2024', amount: '3,200€', status: 'Payé' },
            { month: 'Mai 2024', amount: '3,200€', status: 'Payé' },
            { month: 'Avril 2024', amount: '3,200€', status: 'Payé' },
            { month: 'Mars 2024', amount: '3,200€', status: 'Payé' }
          ].map((payslip, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-800">{payslip.month}</h4>
                <p className="text-sm text-gray-600">Salaire net: {payslip.amount}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {payslip.status}
                </span>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Télécharger
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
