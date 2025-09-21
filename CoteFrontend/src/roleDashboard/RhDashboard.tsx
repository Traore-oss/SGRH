/* eslint-disable react-refresh/only-export-components */
import axios from "axios";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { User, Plus, Eye, Edit, Lock, Filter, ChevronDown, Search, Users, Building2, FileText, Calendar, Clock, Menu, LogOut, Bell, Heart, UserPlus, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment/locale/fr";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../commons/Modal";
import { EmployeeForm } from "../forms/EmployeeForm";
import { CongesManager } from "../pages/Conges";
import  AttendanceManager from "../pages/Pointages";
import { Departments } from "../pages/Departement";
import { PerformanceEmployer } from "../pages/Performance";
import { Reports } from "../pages/Rapport";
import SuiviFormations from "../pages/Formation"
import Recrutement from "../pages/OffreEmploi"
import { toggleEmployeeActive } from "../Components/ServiceEmployer";

// Configuration de l'API
const API_BASE = "http://localhost:8000/api";

// Types
export interface Employee {
  _id: string;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  telephone?: string;
  date_naissance?: string;
  adresse?: string;
  ville?: string;
  poste?: string;
  role?: string;
  typeContrat?: string;
  salaire?: number;
  dateEmbauche?: string;
  isActive?: boolean;
  departement?: {
    _id: string;
    nom: string;
  };
}

export interface Conge {
  _id: string;
  employe: Employee | string;
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  nbJours: number;
  motif?: string;
  etat: "en attente" | "approuvé" | "refusé";
  commentaireResponsable?: string;
  dateSoumission: string;
  dateValidation?: string;
}

// Services API
// eslint-disable-next-line react-refresh/only-export-components
export const getEmployees = async (): Promise<Employee[]> => {
  const res = await axios.get(`${API_BASE}/users`, { withCredentials: true });
  return res.data;
};

// eslint-disable-next-line react-refresh/only-export-components
export const getDemandesConge = async (): Promise<Conge[]> => {
  const res = await axios.get(`${API_BASE}/conges/getAllConges`, { withCredentials: true });
  return res.data;
};

// eslint-disable-next-line react-refresh/only-export-components
export const creerConge = async (data: {
  employeId: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  raison: string;
}) => {
  const res = await axios.post(`${API_BASE}/conges/creerConge`, data, { withCredentials: true });
  return res.data;
};

export const approuverConge = async (id: string) => {
  const res = await axios.put(`${API_BASE}/conges/approuverConge/${id}`, {}, { withCredentials: true });
  return res.data;
};

export const refuserConge = async (id: string) => {
  const res = await axios.put(`${API_BASE}/conges/refuserConge/${id}`, {}, { withCredentials: true });
  return res.data;
};

// Types pour le tableau de bord
interface DashboardStats {
  totalEmployees: number;
  activeEmployees: number;
  onLeave: number;
  absent: number;
  totalLeaves: number;
}

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  type: string;
  allDay?: boolean;
}

// Configuration du calendrier
moment.locale('fr');
const localizer = momentLocalizer(moment);

// Composant StatCard pour afficher les statistiques
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay?: number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, delay = 0, trend }) => (
  <div 
    className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-fadeInUp"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        {trend && (
          <p className={`text-xs mt-1 ${trend.isPositive ? "text-green-600" : "text-red-600"}`}>
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% depuis le mois dernier
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
    </div>
  </div>
);

// Composant pour afficher un élément d'information
const InfoItem: React.FC<{ label: string; value: React.ReactNode; isFullWidth?: boolean }> = ({
  label,
  value,
  isFullWidth = false,
}) => (
  <div className={isFullWidth ? "col-span-2" : ""}>
    <div className="text-xs text-gray-500 uppercase font-medium mb-1">{label}</div>
    <div className="text-sm font-medium text-gray-900">
      {value || <span className="text-gray-400">Non renseigné</span>}
    </div>
  </div>
);

// Menu des vues RH
type HRView =
  | "dashboard"
  | "users"
  | "Recrutement"
  | "attendance"
  | "departments"
  | "reports"
  | "recruitment"
  | "performance"
  | "formation"
  |  "CongesManager"

const hrMenuItems = [
  { id: "dashboard", label: "Tableau de Bord", icon: Heart },
  { id: "users", label: "Gestion Utilisateurs", icon: Users },
  { id: 'CongesManager', label: 'Gestion des Congés', icon: Calendar },
  { id: "attendance", label: "Gestion Présences", icon: Clock },
  { id: "departments", label: "Gestion Départements", icon: Building2 },
   { id: "Recrutement", label: " Gestion des Recurtements", icon: UserPlus },
  { id: "performance", label: "Gestion Performances", icon: TrendingUp },
  { id: "formation", label: "Gestion des Formations", icon: FileText },
  // { id: "reports", label: "Rapports RH", icon: FileText },
];

// Composant Dashboard
const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEmployees: 0,
    activeEmployees: 0,
    onLeave: 0,
    absent: 0,
    totalLeaves: 0
  });
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données du tableau de bord
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const employeesData = await getEmployees();
        const leavesData = await getDemandesConge();
        
        // Calculer les statistiques
        const totalEmployees = employeesData.length;
        const activeEmployees = employeesData.filter(emp => emp.isActive).length;
        const approvedLeaves = leavesData.filter(leave => leave.etat === "approuvé");
        const onLeave = approvedLeaves.length;
        const absent = Math.floor(totalEmployees * 0.05); // Simulation d'absences
        
        setStats({
          totalEmployees,
          activeEmployees,
          onLeave,
          absent,
          totalLeaves: leavesData.length
        });
        
        // Préparer les événements pour le calendrier
        const calendarEvents = approvedLeaves.map(leave => {
          const employeeName = typeof leave.employe === 'string' 
            ? "Employé" 
            : `${leave.employe.prenom} ${leave.employe.nom}`;
            
          return {
            title: `${employeeName} - ${leave.typeConge}`,
            start: new Date(leave.dateDebut),
            end: new Date(new Date(leave.dateFin).setHours(23, 59, 59)), // Fin de journée
            type: leave.typeConge,
            allDay: true
          };
        });
        
        setEvents(calendarEvents);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        toast.error("Erreur lors du chargement des données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Données pour le diagramme circulaire
  const pieChartData = useMemo(() => [
    { name: 'Présents', value: stats.activeEmployees - stats.onLeave - stats.absent },
    { name: 'En congé', value: stats.onLeave },
    { name: 'Absents', value: stats.absent }
  ], [stats]);

  // Couleurs pour le diagramme circulaire
  const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

  // Style des événements du calendrier
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = '#3B82F6'; // Bleu par défaut
    
    if (event.type.includes('maladie') || event.type.toLowerCase().includes('sick')) {
      backgroundColor = '#EF4444'; // Rouge pour les congés maladie
    } else if (event.type.includes('annuel') || event.type.toLowerCase().includes('annual')) {
      backgroundColor = '#10B981'; // Vert pour les congés annuels
    } else if (event.type.includes('exceptionnel') || event.type.toLowerCase().includes('exceptional')) {
      backgroundColor = '#8B5CF6'; // Violet pour les congés exceptionnels
    }
    
    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Formateur de date pour le calendrier
  const formats = {
    dateFormat: 'D',
    dayFormat: (date: Date, culture: string, localizer: any) => 
      localizer.format(date, 'DD', culture),
    monthHeaderFormat: (date: Date, culture: string, localizer: any) =>
      localizer.format(date, 'MMMM YYYY', culture),
    dayHeaderFormat: (date: Date, culture: string, localizer: any) =>
      localizer.format(date, 'dddd DD MMM', culture),
    dayRangeHeaderFormat: ({ start, end }: { start: Date; end: Date }, culture: string, localizer: any) =>
      `${localizer.format(start, 'DD MMM', culture)} - ${localizer.format(end, 'DD MMM', culture)}`,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Cartes de statistiques avec animations */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Employés" 
          value={stats.totalEmployees} 
          icon={<Users className="h-6 w-6 text-white" />} 
          color="bg-blue-500" 
          delay={0}
        />
        <StatCard 
          title="Employés Actifs" 
          value={stats.activeEmployees} 
          icon={<User className="h-6 w-6 text-white" />} 
          color="bg-green-500" 
          delay={100}
        />
        <StatCard 
          title="Total Congés" 
          value={stats.totalLeaves} 
          icon={<Calendar className="h-6 w-6 text-white" />} 
          color="bg-purple-500" 
          delay={200}
        />
        <StatCard 
          title="En Congé Actuel" 
          value={stats.onLeave} 
          icon={<Clock className="h-6 w-6 text-white" />} 
          color="bg-yellow-500" 
          delay={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagramme circulaire pour la présence */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeInUp" style={{ animationDelay: '400ms' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Présence des Employés</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  animationBegin={500}
                  animationDuration={1000}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} employés`, '']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Calendrier des congés */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-fadeInUp" style={{ animationDelay: '500ms' }}>
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Calendrier des Congés</h3>
          <div className="h-64">
            <BigCalendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              eventPropGetter={eventStyleGetter}
              views={['month']}
              tooltipAccessor={(event) => event.title}
              formats={formats}
              messages={{
                today: "Aujourd'hui",
                previous: "Précédent",
                next: "Suivant",
                month: "Mois",
                showMore: (total) => `+${total} de plus`,
              }}
              popup
              className="calendar-container"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Composant pour afficher la gestion des employés avec les fonctionnalités complètes
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
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

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

const toggleActive = async (userId: string, isActive: boolean, userName: string) => {
  try {
    // Appel réel à l'API
    const data = await toggleEmployeeActive(userId); // { message, utilisateur }

    // Mettre à jour la liste des employés localement
    setEmployees(prev =>
      prev.map(emp => emp._id === userId ? { ...emp, isActive: data.utilisateur.isActive } : emp)
    );

    toast.success(data.message);
  } catch (err: any) {
    console.error(err);
    toast.error(err.message || "Impossible de changer l'état de l'utilisateur.");
  }
};


  const calculateSeniority = (dateEmbauche: string): string => {
    if (!dateEmbauche) return "Non défini";
    const embauche = new Date(dateEmbauche);
    const maintenant = new Date();
    const diffTime = Math.abs(maintenant.getTime() - embauche.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    if (years > 0) {
      return `${years} an${years > 1 ? "s" : ""} ${months > 0 ? `et ${months} mois` : ""}`;
    } else if (months > 0) {
      return `${months} mois`;
    } else {
      return `${diffDays} jour${diffDays > 1 ? "s" : ""}`;
    }
  };

  // Statistiques
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(e => e.isActive).length;
  const inactiveEmployees = employees.filter(e => !e.isActive).length;
  
  // Filtrage par rôle et département
  const roles = Array.from(new Set(employees.map(e => e.role).filter(Boolean))) as string[];
  const departments = Array.from(new Set(employees.map(e => e.departement?.nom).filter(Boolean))) as string[];
  
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
    
    const matchesDepartment = departmentFilter === 'all' || e.departement?.nom === departmentFilter;
    
    return matchesSearch && matchesStatus && matchesRole && matchesDepartment;
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
    <div className="space-y-6 p-6">
      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Employés" value={totalEmployees} icon={<Users className="h-6 w-6 text-white" />} color="bg-blue-500" delay={0} />
        <StatCard title="Employés Actifs" value={activeEmployees} icon={<User className="h-6 w-6 text-white" />} color="bg-green-500" delay={100} />
        <StatCard title="Employés Inactifs" value={inactiveEmployees} icon={<User className="h-6 w-6 text-white" />} color="bg-red-500" delay={200} />
        <StatCard title="Départements" value={departments.length} icon={<Building2 className="h-6 w-6 text-white" />} color="bg-purple-500" delay={300} />
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
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-10 animate-fadeInUp">
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
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Département</div>
                        <select
                          value={departmentFilter}
                          onChange={e => setDepartmentFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm transition-colors focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="all">Tous les départements</option>
                          {departments.map(dept => (
                            <option key={dept} value={dept}>{dept}</option>
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
            <span>Ajouter un employé</span>
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
                  {/* <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Poste</th> */}
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
                    {/* <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-900">{u.poste || '-'}</div>
                    </td> */}
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
                          onClick={() => toggleActive(u._id, !!u.isActive, `${u.prenom} ${u.nom}`)}
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
                        <p>Aucun employé trouvé</p>
                        {(statusFilter !== 'all' || roleFilter !== 'all' || departmentFilter !== 'all') && (
                          <button 
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2 transition-colors"
                            onClick={() => {
                              setStatusFilter('all');
                              setRoleFilter('all');
                              setDepartmentFilter('all');
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
          <Modal show title="Créer un utilisateur" onClose={() => setShowAddModal(false)}>
            <EmployeeForm 
              onClose={() => setShowAddModal(false)} 
              onSubmit={() => {
                setShowAddModal(false);
                fetchEmployees();
                toast.success('Utilisateur créé avec succès');
              }} 
            />
          </Modal>
        )}
        {showEditModal && selectedUser && (
          <Modal show title="Modifier utilisateur" onClose={() => setShowEditModal(false)} size="lg">
            <EmployeeForm 
              user={selectedUser} 
              onClose={() => setShowEditModal(false)}
              onSubmit={() => {
                setShowEditModal(false);
                fetchEmployees();
                toast.success('Utilisateur modifié avec succès');
              }}
            />
          </Modal>
        )}
        {showViewModal && selectedUser && (
          <Modal show title="Détails utilisateur" onClose={() => setShowViewModal(false)} size="lg">
            <div className="space-y-6">
              {/* Header avec photo et badges */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 h-20 w-20 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-medium">{selectedUser.prenom?.[0]}{selectedUser.nom?.[0]}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold">{selectedUser.prenom} {selectedUser.nom}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${selectedUser.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {selectedUser.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(selectedUser.role || '')}`}>
                      {selectedUser.role || 'Non défini'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Infos détaillées */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informations personnelles */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium border-b pb-2">Informations Personnelles</h4>
                  <InfoItem label="Email" value={selectedUser.email} />
                  <InfoItem label="Téléphone" value={selectedUser.telephone} />
                  <InfoItem label="Date de naissance" value={selectedUser.date_naissance ? new Date(selectedUser.date_naissance).toLocaleDateString('fr-FR') : '-'} />
                  <InfoItem label="Adresse" value={selectedUser.adresse} />
                  <InfoItem label="Ville" value={selectedUser.ville} />
                </div>

                {/* Informations professionnelles */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium border-b pb-2">Informations Professionnelles</h4>
                  <InfoItem label="Poste" value={selectedUser.poste} />
                  <InfoItem label="Département" value={selectedUser.departement?.nom} />
                  <InfoItem label="Type de contrat" value={selectedUser.typeContrat} />
                  <InfoItem label="Salaire" value={selectedUser.salaire ? formatCurrency(selectedUser.salaire) : '-'} />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg" onClick={() => {
                  setShowViewModal(false);
                  setShowEditModal(true);
                }}>
                  Modifier
                </button>
                <button className="px-4 py-2 border rounded-lg" onClick={() => setShowViewModal(false)}>Fermer</button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

// Composant principal HRDashboard
export const HRDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [activeView, setActiveView] = useState<HRView>("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [unauthorized, setUnauthorized] = useState(false)

  // Écouter les événements de déconnexion
  useEffect(() => {
    const handleUnauthorized = () => {
      setUnauthorized(true)
      toast.error("Session expirée. Veuillez vous reconnecter.")
      setTimeout(() => {
        handleLogout()
      }, 2000)
    }

    window.addEventListener("unauthorized", handleUnauthorized)
    return () => {
      window.removeEventListener("unauthorized", handleUnauthorized)
    }
  }, [])

  const handleLogout = async () => {
    try {
      setLogoutLoading(true)
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error)
    } finally {
      setLogoutLoading(false)
      setShowUserDropdown(false)
    }
  }

  const renderView = () => {
    if (unauthorized) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-600 text-lg mb-4">Session expirée</div>
          <button onClick={handleLogout} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Se reconnecter
          </button>
        </div>
      )
    }

    switch (activeView) {
      case "dashboard":
        return <Dashboard />
      case "users":
        return <UserManagement />
      case "CongesManager":
        return <CongesManager />
      case "attendance":
        return <AttendanceManager />
      case "departments":
        return <Departments />
      case "reports":
        return <Reports />
      case "Recrutement":
        return <Recrutement />
      case "performance":
        return <PerformanceEmployer />
      case "formation":
        return <SuiviFormations />
      default:
        return <Dashboard />
    }
  }

  const getViewTitle = () => {
    const titles = {
      dashboard: "Tableau de Bord RH",
      users: "Gestion des Employés",
      Recrutement: "Gestion des Recurtements",
      CongesManager: "Validation des Congés",
      attendance: "Gestion  des Pointages",
      departments: "Gestion des Departements",
      reports: "Rapports RH",
      performance: "Performances",
      formation: "Suivi des Formations"
    }
    return titles[activeView] || "Ressources Humaines"
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ToastContainer
        position="top-right"
        autoClose={8000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* Sidebar RH */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-40 transition-all duration-300 ${
          sidebarCollapsed ? "w-16" : "w-64"
        }`}
      >
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
                <h1 className="text-xl font-bold text-gray-800">RH</h1>
                <p className="text-xs text-gray-500">Ressources Humaines</p>
              </div>
            )}
          </div>
        </div>

        <nav className="mt-6">
          {hrMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = activeView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id as HRView)}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${
                  isActive
                    ? "bg-blue-50 text-blue-600 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                }`}
                title={sidebarCollapsed ? item.label : ""}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            )
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
            {!sidebarCollapsed && <span>{logoutLoading ? "Déconnexion..." : "Déconnexion"}</span>}
          </button>
        </div>
      </div>

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        {/* Header RH avec profil utilisateur */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{getViewTitle()}</h1>
              <p className="text-sm text-gray-600">
                Bienvenue, {user.prenom} {user.nom}
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
                      {user.prenom?.[0]}
                      {user.nom?.[0]}
                    </span>
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-gray-900">
                      {user.prenom} {user.nom}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
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
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
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
                        <span>{logoutLoading ? "Déconnexion..." : "Déconnexion"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">{renderView()}</div>
      </main>

      {/* Styles CSS pour le calendrier */}
      <style>
        {`
          .rbc-month-view {
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
          }
          .rbc-header {
            border-bottom: 1px solid #e5e7eb;
            padding: 8px 0;
            font-weight: 600;
            color: #374151;
          }
          .rbc-date-cell {
            text-align: center;
            padding: 4px;
          }
          .rbc-off-range {
            color: #9ca3af;
          }
          .rbc-today {
            background-color: #eff6ff;
          }
          .rbc-event {
            border: none;
            border-radius: 4px;
            padding: 2px 4px;
            font-size: 0.75rem;
            margin: 1px;
          }
          .rbc-row-content {
            z-index: 1;
          }
          .rbc-show-more {
            background-color: rgba(255, 255, 255, 0.8);
            z-index: 2;
            padding: 2px 4px;
            border-radius: 3px;
            font-weight: 500;
          }
          .calendar-container {
            height: 100%;
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
          .animate-fadeInUp {
            animation: fadeInUp 0.5s ease-out;
          }
          .hover-lift:hover {
            transform: translateY(-2px);
            transition: transform 0.2s ease-in-out;
          }
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
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
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .animate-pulse {
            animation: pulse 2s infinite;
          }
        `}
      </style>
    </div>
  )
}