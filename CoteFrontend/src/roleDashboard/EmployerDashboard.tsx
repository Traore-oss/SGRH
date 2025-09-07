import React, { useState } from 'react';
import { 
  User, 
  Calendar, 
  Clock, 
  FileText, 
  Target,
  Award,
  Menu,
  LogOut,
  Briefcase,
  ChevronDown,
  Bell,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

type EmployeeView = 'dashboard' | 'profile' | 'leaves' | 'attendance' | 'goals' | 'payslips';

const employeeMenuItems = [
  { id: 'dashboard', label: 'Mon Tableau de Bord', icon: Briefcase },
  { id: 'profile', label: 'Mon Profil', icon: User },
  { id: 'leaves', label: 'Mes Congés', icon: Calendar },
  { id: 'attendance', label: 'Mes Présences', icon: Clock },
  { id: 'goals', label: 'Mes Objectifs', icon: Target },
  { id: 'payslips', label: 'Bulletins de Paie', icon: FileText },
];

export const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<EmployeeView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLogoutLoading(false);
      setShowUserDropdown(false);
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <EmployeeOverview />;
      case 'profile':
        return <EmployeeProfile />;
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

  if (!user) {
    return null;
  }

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
      
      {/* Sidebar Employé en blanc */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="p-4">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-800" />
            </button>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-xl font-bold text-gray-800">MON ESPACE</h1>
                <p className="text-xs text-gray-500">Employé</p>
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
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
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

        {/* Section déconnexion dans le sidebar */}
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            disabled={logoutLoading}
            className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {logoutLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
            ) : (
              <LogOut className="h-5 w-5" />
            )}
            {!sidebarCollapsed && (
              <span>{logoutLoading ? 'Déconnexion...' : 'Déconnexion'}</span>
            )}
          </button>
        </div>
      </div>
      
      <main className={`flex-1 transition-all duration-300 ${
        sidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* Header Employé avec profil utilisateur */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {getViewTitle()}
              </h1>
              <p className="text-sm text-gray-600">
                Bonjour, {user.prenom} {user.nom}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Bouton notifications */}
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* Profil utilisateur avec dropdown */}
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user.prenom?.[0]}{user.nom?.[0]}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">
                      {user.role}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">
                        {user.prenom} {user.nom}
                      </div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <button 
                        onClick={() => setActiveView('profile')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Mon profil
                      </button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Paramètres
                      </button>
                    </div>
                    <div className="border-t border-gray-200 py-1">
                      <button
                        onClick={handleLogout}
                        disabled={logoutLoading}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50"
                      >
                        {logoutLoading ? (
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                        ) : (
                          <LogOut className="h-4 w-4" />
                        )}
                        <span>{logoutLoading ? 'Déconnexion...' : 'Déconnexion'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
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

// Profil employé avec données dynamiques
const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Informations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <p className="text-gray-800">{user.prenom} {user.nom}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
            <p className="text-gray-800">{user.matricule || 'Non attribué'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-800">{user.email}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rôle</label>
            <p className="text-gray-800 capitalize">{user.role}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <p className="text-gray-800">{user.isActive ? 'Actif' : 'Inactif'}</p>
          </div>
          {user.departement && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
              <p className="text-gray-800">{user.departement}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
const EmployeeLeaves: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    typeConge: '',
    dateDebut: '',
    dateFin: '',
    motif: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [id]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ajouter automatiquement le matricule de l'utilisateur connecté
      const requestData = {
        ...formData,
        matricule: user.matricule // Utilisation directe du matricule
      };
      // const response = await axios.post('http://localhost:8000/api/conges/creerConge', requestData);

      const response = await axios.post('http://localhost:8000/api/conges/creerConge', requestData);
      if (response.status === 201) {
        toast.success('Demande de congé soumise avec succès!');
        setFormData({ typeConge: '', dateDebut: '', dateFin: '', motif: '' });
        setShowForm(false);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Erreur lors de la soumission de la demande');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Mes Demandes de Congé</h3>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            disabled={loading}
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-1" />
                Annuler
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-1" />
                Nouvelle demande
              </>
            )}
          </button>
        </div>

        {/* Formulaire de demande de congé */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouvelle Demande de Congé</h3>
            
            {/* Affichage informatif du matricule */}
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Matricule:</strong> {user.matricule}
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type de congé</label>
                  <select
                    id="typeConge"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    value={formData.typeConge}
                    onChange={handleInputChange}
                  >
                    <option value="">-- Sélectionner --</option>
                    <option value="Congés payés">Congés payés</option>
                    <option value="Congé maladie">Congé maladie</option>
                    <option value="Congé maternité">Congé maternité</option>
                    <option value="Congé paternité">Congé paternité</option>
                    <option value="Absence exceptionnelle">Absence exceptionnelle</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date début</label>
                  <input
                    type="date"
                    id="dateDebut"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    value={formData.dateDebut}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date fin</label>
                  <input
                    type="date"
                    id="dateFin"
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    value={formData.dateFin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
                <textarea
                  id="motif"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  value={formData.motif}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Soumettre la demande'}
              </button>
            </form>
          </div>
        )}

        {/* ... reste du code inchangé ... */}
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
              <h4 className="font-medium text край-800">Projet E-commerce</h4>
              <span className="text-sm text-green-600 font-medium">90%</span>
            </div>
            <div className="w-full bg-green-200 rounded-full h-2">
              <div className="bg-green-600 h-2 rounded-full" style={{ width: '90%' }}></div>
            </div>
            <p className="text-sm text-gray-600 край-2">Échéance: 15 septembre 2024</p>
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
                <span className="px-3 py-1 край-100 text-green-800 rounded-full text-sm font-medium">
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