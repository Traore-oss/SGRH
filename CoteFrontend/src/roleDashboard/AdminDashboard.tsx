/* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useState } from 'react';
import {
  Users, Building2, FileText, Settings, BarChart3, Calendar,
  Clock, Menu, LogOut, Edit, Eye, Filter, Search, X, Plus, User, Bell, ChevronDown, Lock
} from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {useAuth} from '../context/AuthContext';
import { getEmployees, type Employee } from '../Components/ServiceEmployer';
import { Dashboard } from '../pages/Dashboard';
import { Leaves } from '../pages/Conges';
import { AttendanceManager } from '../pages/Pointages';
import { Departments } from '../pages/Departement';
import { PerformanceEmployer } from '../pages/Performance';
import { Reports } from '../pages/Rapport';
import Salaire from "../pages/Salaire";
import SuiviFormations from "../pages/Formation";
import { EmployeeForm } from '../forms/EmployeeForm';
import { type Key, type ReactElement, type JSXElementConstructor, type ReactNode, type ReactPortal, useState, useEffect } from 'react';

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

// ==================== UserManagement amélioré ====================
export const UserManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      console.log("Début du chargement des employés...");
      const data = await getEmployees();
      console.log("Employés chargés:", data);
      setEmployees(data);
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error);
      toast.error('Erreur lors du chargement des employés');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchEmployees(); 
  }, []);

  const toggleIsActive = async (userId: string, isActive: boolean, userName: string) => {
    try {
      const url = `${API_BASE}/api/Users/${isActive ? 'deactivateEmployee' : 'activateEmployee'}/${userId}`;
      await axios.patch(url, {}, { withCredentials: true });
      setEmployees(prev => prev.map(u => u._id === userId ? { ...u, isActive: !isActive } : u));

      toast.success(`Utilisateur ${userName} ${isActive ? 'désactivé' : 'activé'} avec succès`);
    } catch (err) {
      console.error(err);
      toast.error("Impossible de changer l'état de l'utilisateur.");
    }
  };

  // Statistiques
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.isActive).length;
  const inactiveEmployees = employees.filter(e => !e.isActive).length;
  
  // Filtrage par rôle
  const roles = Array.from(new Set(employees.map(e => e.role).filter(Boolean))) as string[];
  
  const filteredEmployees = employees.filter(e => {
    const matchesSearch = 
      (e.nom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.prenom || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.matricule || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' || 
      (statusFilter === 'active' && e.isActive) || 
      (statusFilter === 'inactive' && !e.isActive);
    
    const matchesRole = roleFilter === 'all' || e.role === roleFilter;
    
    return matchesSearch && matchesStatus && matchesRole;
  });

  const displayStatut = (u: Employee) => (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
      {u.isActive ? 'Actif' : 'Inactif'}
    </span>
  );

  const getRoleBadgeClass = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employé': return 'bg-green-100 text-green-800';
      case 'rh': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Employés"
          value={totalEmployees}
          icon={<Users className="h-6 w-6 text-white" />}
          color="bg-blue-500"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Employés Actifs"
          value={activeEmployees}
          icon={<User className="h-6 w-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Employés Inactifs"
          value={inactiveEmployees}
          icon={<User className="h-6 w-6 text-white" />}
          color="bg-red-500"
        />
        <StatCard
          title="Départements"
          value={new Set(employees.map(e => e.departement?.nom).filter(Boolean)).size}
          icon={<Building2 className="h-6 w-6 text-white" />}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <button 
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtres</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10">
                    <div className="text-sm font-medium text-gray-700 mb-2">Filtrer par</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Statut</div>
                        <select
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="all">Tous</option>
                          <option value="active">Actifs</option>
                          <option value="inactive">Inactifs</option>
                        </select>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Rôle</div>
                        <select
                          value={roleFilter}
                          onChange={e => setRoleFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="all">Tous les rôles</option>
                          {roles.map(role => (
                            <option key={role} value={role}>{role}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full lg:w-auto"
            onClick={() => setShowAddModal(true)}
          >
            <Plus className="h-4 w-4" />
            <span>Créer un utilisateur</span>
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Contact</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Poste</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Département</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Salaire</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Rôle</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {u.prenom?.[0]}{u.nom?.[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {u.prenom} {u.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {u.matricule || '-'}
                          </div>
                          <div className="text-xs text-gray-400 lg:hidden">
                            {u.email || '-'}
                          </div>
                        </div>
                        </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm text-gray-900">{u.email || '-'}</div>
                      <div className="text-sm text-gray-500">{u.telephone || '-'}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-900">{u.poste || '-'}</div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{u.departement?.nom || '-'}</div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="text-sm text-gray-900">
                        {u.salaire ? formatCurrency(Number(u.salaire)) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {displayStatut(u)}
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(u.role || '')}`}>
                        {u.role || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <button 
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => { setSelectedUser(u); setShowViewModal(true); }}
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            u.isActive 
                              ? 'text-red-500 hover:bg-red-50' 
                              : 'text-green-500 hover:bg-green-50'
                          }`}
                          onClick={() => toggleIsActive(u._id, !!u.isActive, `${u.prenom} ${u.nom}`)}
                          title={u.isActive ? 'Désactiver' : 'Activer'}
                        >
                          {u.isActive ? <Lock className="h-4 w-4" /> : 'Activer'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && filteredEmployees.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-gray-300 mb-2" />
                        <p>Aucun utilisateur trouvé</p>
                        {(statusFilter !== 'all' || roleFilter !== 'all') && (
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                            onClick={() => {
                              setStatusFilter('all');
                              setRoleFilter('all');
                            }}
                          >
                            Réinitialiser les filtres
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {showAddModal && (
          <Modal onClose={() => setShowAddModal(false)} title="Nouvel Utilisateur" size="lg">
            <EmployeeForm
              onSubmit={() => { 
                setShowAddModal(false); 
                fetchEmployees();
                toast.success('Utilisateur créé avec succès');
              }}
              onClose={() => setShowAddModal(false)}
            />
          </Modal>
        )}

        {showEditModal && selectedUser && (
          <Modal onClose={() => setShowEditModal(false)} title="Modifier Utilisateur" size="lg">
            <EmployeeForm
              user={selectedUser}
              onSubmit={() => { 
                setShowEditModal(false); 
                fetchEmployees();
                toast.success('Utilisateur modifié avec succès');
              }}
              onClose={() => setShowEditModal(false)}
            />
          </Modal>
        )}

        {showViewModal && selectedUser && (
          <Modal onClose={() => setShowViewModal(false)} title="Détails de l'Employé" size="lg">
            <div className="space-y-6">
              {/* En-tête avec photo et informations principales */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-2xl">
                    {selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">{selectedUser.prenom} {selectedUser.nom}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedUser.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(selectedUser.role || '')}`}>
                      {selectedUser.role || 'Non défini'}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {selectedUser.matricule || 'Sans matricule'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grille d'informations détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800 border-b pb-2">Informations Personnelles</h4>
                  <div className="space-y-3">
                    <InfoItem label="Email" value={selectedUser.email} />
                    <InfoItem label="Téléphone" value={selectedUser.telephone} />
                    <InfoItem label="Date de naissance" value={selectedUser.date_naissance ? new Date(selectedUser.date_naissance).toLocaleDateString('fr-FR') : '-'} />
                    <InfoItem label="Adresse" value={selectedUser.adresse} />
                    <InfoItem label="Ville" value={selectedUser.ville} />
                    <InfoItem label="Code postal" value={selectedUser.codePostal} />
                  </div>
                </div>

                {/* Informations professionnelles */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800 border-b pb-2">Informations Professionnelles</h4>
                  <div className="space-y-3">
                    <InfoItem label="Poste" value={selectedUser.poste} />
                    <InfoItem label="Département" value={selectedUser.departement?.nom} />
                    <InfoItem label="Type de contrat" value={selectedUser.typeContrat} />
                    <InfoItem label="Date d'embauche" value={selectedUser.date_embauche ? new Date(selectedUser.date_embauche).toLocaleDateString('fr-FR') : '-'} />
                    <InfoItem label="Salaire" value={selectedUser.salaire ? formatCurrency(Number(selectedUser.salaire)) : '-'} />
                    <InfoItem label="Statut marital" value={selectedUser.statutMarital} />
                  </div>
                </div>

                {/* Informations complémentaires */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800 border-b pb-2">Informations Complémentaires</h4>
                  <div className="space-y-3">
                    <InfoItem label="Numéro CNSS" value={selectedUser.numeroCNSS} />
                    <InfoItem label="Numéro CIN" value={selectedUser.numeroCIN} />
                    <InfoItem label="Banque" value={selectedUser.banque} />
                    <InfoItem label="Numéro de compte" value={selectedUser.numeroCompte} />
                    <InfoItem label="Personne à contacter" value={selectedUser.personneContact} />
                    <InfoItem label="Téléphone urgence" value={selectedUser.telephoneUrgence} />
                  </div>
                </div>

                {/* Statistiques et performances */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium text-gray-800 border-b pb-2">Statistiques</h4>
                  <div className="space-y-3">
                    <InfoItem label="Jours de congé restants" value={selectedUser.joursCongesRestants || '0'} />
                    <InfoItem label="Ancienneté" value={selectedUser.date_embauche ? calculateSeniority(selectedUser.date_embauche) : '-'} />
                    <InfoItem label="Dernière évaluation" value={selectedUser.derniereEvaluation ? new Date(selectedUser.derniereEvaluation).toLocaleDateString('fr-FR') : 'Non évalué'} />
                    <InfoItem label="Notes" value={selectedUser.notes || 'Aucune note'} isFullWidth />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(selectedUser);
                    setShowEditModal(true);
                  }}
                >
                  Modifier
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  onClick={() => setShowViewModal(false)}
                >
                  Fermer
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};
// ==================== AdminDashboard amélioré ====================
type AdminView = 'dashboard' | 'leaves' | 'attendance' | 'departments' | 'reports' | 'settings' | 'users' | 'Performance' |'SuiviFormations' | 'Salaire';
const adminMenuItems = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3 },
  { id: 'departments', label: 'Départements', icon: Building2 },
  { id: 'leaves', label: 'Congés', icon: Calendar },
  { id: 'attendance', label: 'Présences', icon: Clock },
  { id: 'Performance', label: 'Performance', icon: FileText },
  { id: 'SuiviFormations', label: 'SuiviFormations', icon: FileText },
  { id: 'reports', label: 'Rapports', icon: FileText },
  { id: 'Salaire', label: 'Salaire', icon: FileText },
  { id: 'users', label: 'Utilisateurs', icon: Users },
  { id: 'settings', label: 'Paramètres', icon: Settings },
];

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeView, setActiveView] = useState<AdminView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Simuler la récupération des notifications
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        // Simulation de données de notification
        const mockNotifications = [
          { id: 1, type: 'leave', message: 'Nouvelle demande de congé', timestamp: new Date(), read: false },
          { id: 2, type: 'attendance', message: 'Pointage en retard signalé', timestamp: new Date(), read: false },
          { id: 3, type: 'salary', message: 'Paiement de salaire effectué', timestamp: new Date(), read: true },
        ];
        setNotifications(mockNotifications);
      } catch (error) {
        console.error('Erreur lors du chargement des notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  const renderView = () => {
    switch (activeView) {
      case 'dashboard': return <Dashboard />;
      case 'leaves': return <Leaves />;
      case 'attendance': return <AttendanceManager />;
      case 'Performance': return <PerformanceEmployer />;
      case 'departments': return <Departments />;
      case 'SuiviFormations': return <SuiviFormations />;
      case 'reports': return <Reports />;
      case 'Salaire': return <Salaire />;
      case 'users': return <UserManagement />;
      case 'settings': return <div className="p-4">Paramètres Système</div>;
      default: return <Dashboard />;
    }
  };

  const getViewTitle = (): string => {
    const titles: Record<AdminView, string> = {
      dashboard: 'Tableau de Bord Administrateur',
      departments: 'Gestion des Départements',
      leaves: 'Gestion des Congés',
      attendance: 'Gestion des Présences',
      Performance: 'Gestion des Performances',
      SuiviFormations: 'Gestion des Formations',
      reports: 'Rapports et Statistiques',
      Salaire: 'Rapports et Paiement',
      users: 'Gestion des Utilisateurs',
      settings: 'Paramètres Système'
    };
    return titles[activeView] || 'Tableau de Bord';
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
      <div className={`hidden md:flex fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'}`}>
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center space-x-3">
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)} 
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-800" />
            </button>
            {!sidebarCollapsed && (
              <div>
                <p className="text-xs text-gray-500">ADMIN <br /> Contrôle total</p>
              </div>
            )}
          </div>
          <nav className="mt-6 flex-1">
            {adminMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id as AdminView);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span>{item.label}</span>}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
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
          <div className="fixed left-0 top-0 h-full bg-white w-64 shadow-lg z-50" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 flex items-center justify-between border-b border-gray-200">
              <div>
                <h1 className="text-xl font-bold text-gray-800">ADMIN</h1>
                <p className="text-xs text-gray-500">Contrôle total</p>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="mt-6">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveView(item.id as AdminView);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
              <button 
                onClick={handleLogout} 
                className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
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
            <div className="relative">
              <button 
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                onClick={() => {
                  // Marquer les notifications comme lues
                  setNotifications(notifications.map(n => ({ ...n, read: true })));
                }}
              >
                <Bell className="h-5 w-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>
              
              {/* Dropdown des notifications */}
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 hidden group-hover:block">
                <div className="px-4 py-2 border-b border-gray-200">
                  <h3 className="font-medium text-gray-800">Notifications</h3>
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">Aucune notification</div>
                  ) : (
                    notifications.map((notification: { id: Key | null | undefined; read: any; message: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined; timestamp: string | number | Date; }) => (
                      <div 
                        key={notification.id} 
                        className={`px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
                      >
                        <div className="text-sm text-gray-800">{notification.message}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString('fr-FR')}
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-gray-200">
                  <button className="text-sm text-blue-600 hover:text-blue-800">
                    Voir toutes les notifications
                  </button>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.prenom?.[0]}{user?.nom?.[0]}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.prenom} {user?.nom}
                  </div>
                  <div className="text-xs text-gray-500 capitalize">
                    {user?.role}
                  </div>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
              
              {showUserDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <div className="text-sm font-medium text-gray-900">{user?.prenom} {user?.nom}</div>
                    <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
                  </div>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Mon profil
                  </button>
                  <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Historique des activités
                  </button>
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