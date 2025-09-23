/* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Users, Building2,Edit, Eye, Filter, Search, X, Plus, User,ChevronDown, Lock,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { getEmployees, toggleEmployeeActive,type Employee } from '../Components/ServiceEmployer';
import { toast } from 'react-toastify';
import { EmployeeForm } from '../forms/EmployeeForm';
// ==================== Styles d'animation ====================
const cardAnimation = `
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes pulse {
    0% {
      transform: scale(1);
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
    }
  }
  
  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(0);
    }
    40%, 43% {
      transform: translateY(-10px);
    }
    70% {
      transform: translateY(-5px);
    }
    90% {
      transform: translateY(-2px);
    }
  }
  
  .animate-fadeInUp {
    animation: fadeInUp 0.5s ease-out forwards;
  }
  
  .animate-slideInLeft {
    animation: slideInLeft 0.4s ease-out forwards;
  }
  
  .animate-pulse {
    animation: pulse 2s infinite;
  }
  
  .animate-bounce {
    animation: bounce 1s infinite;
  }
  
  .hover-lift {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  
  .hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  }
  
  .sidebar-item {
    transition: all 0.3s ease;
    position: relative;
    overflow: hidden;
  }
  
  .sidebar-item::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
    transition: left 0.5s;
  }
  
  .sidebar-item:hover::before {
    left: 100%;
  }
  
  .sidebar-item.active {
    box-shadow: inset 3px 0 0 #3b82f6;
  }
`;

// Ajout des styles d'animation au document
const styleSheet = document.createElement("style");
styleSheet.innerText = cardAnimation;
document.head.appendChild(styleSheet);

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeInUp">
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
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend, delay = 0 }) => (
  <div 
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover-lift animate-fadeInUp"
    style={{ animationDelay: `${delay}ms` }}
  >
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
      <div className={`p-3 rounded-lg ${color} transition-transform duration-300 hover:animate-pulse`}>
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

const toggleActive = async (userId: string) => {
  try {
    const data = await toggleEmployeeActive(userId);

    setEmployees(prev =>
      prev.map(emp => emp._id === userId ? { ...emp, isActive: data.utilisateur.isActive } : emp)
    );

    toast.success(data.message);
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Impossible de changer l'état de l'utilisateur.");
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
          delay={0}
        />
        <StatCard
          title="Employés Actifs"
          value={activeEmployees}
          icon={<User className="h-6 w-6 text-white" />}
          color="bg-green-500"
          delay={100}
        />
        <StatCard
          title="Employés Inactifs"
          value={inactiveEmployees}
          icon={<User className="h-6 w-6 text-white" />}
          color="bg-red-500"
          delay={200}
        />
        {/* <StatCard
          title="Départements"
          value={new Set(employees.map(e => e.departement?.nom).filter(Boolean)).size}
          icon={<Building2 className="h-6 w-6 text-white" />}
          color="bg-purple-500"
          delay={300}
        /> */}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeInUp">
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un utilisateur..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 focus:shadow-md"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative">
                <button 
                  className="inline-flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full hover-lift"
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                >
                  <Filter className="h-4 w-4" />
                  <span>Filtres</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
                </button>
                
                {isFilterOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 animate-fadeInUp">
                    <div className="text-sm font-medium text-gray-700 mb-2">Filtrer par</div>
                    <div className="space-y-3">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Statut</div>
                        <select
                          value={statusFilter}
                          onChange={e => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm transition-colors focus:ring-2 focus:ring-blue-500"
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
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm transition-colors focus:ring-2 focus:ring-blue-500"
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 w-full lg:w-auto hover-lift animate-pulse"
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
                {filteredEmployees.map((u, index) => (
                  <tr 
                    key={u._id} 
                    className="hover:bg-gray-50 transition-all duration-300 animate-fadeInUp"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center transition-transform hover:scale-110">
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
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all duration-300 hover:scale-110"
                          onClick={() => { setSelectedUser(u); setShowViewModal(true); }}
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-all duration-300 hover:scale-110"
                          onClick={() => { setSelectedUser(u); setShowEditModal(true); }}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                          <button
                                className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                                u.isActive 
                                ? 'text-red-500 hover:bg-red-50' 
                                : 'text-green-500 hover:bg-green-50'
                                }`}
                                onClick={() => toggleActive(u._id)}
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
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2 transition-colors"
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
                <div className="flex-shrink-0 h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center transition-transform hover:scale-105">
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
                  {selectedUser.employer?.matricule || 'Sans matricule'}
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors hover-lift"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedUser(selectedUser);
                    setShowEditModal(true);
                  }}
                >
                  Modifier
                </button>
                <button
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors hover-lift"
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
