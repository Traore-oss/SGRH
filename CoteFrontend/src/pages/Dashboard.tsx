/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../context/AuthContext';
import { CongesManager } from './Conges';
import AttendanceManager from './Pointages';
import { Departments } from './Departement';
import Recrutement from './OffreEmploi';
import SuiviFormations from './Formation';
import { PerformanceEmployer } from './Performance';
import PaiementPage from './PaiementPage';
import { 
  Menu, Home, Users, Calendar, User, LogOut, Bell, Mail, Settings, 
  ChevronDown, X, TrendingUp, Clock, Target, Award, Building2,
  DollarSign, 
} from 'lucide-react';
import { UserManagement } from '../roleDashboard/AdminDashboard';
import { getEmployees } from '../Components/ServiceEmployer';
import { getDemandesConge } from '../roleDashboard/RhDashboard';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';

// Enregistrer les composants de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

// ✅ Type HRView
type HRView =
  | "dashboard"
  | "users"
  | "CongesManager"
  | "attendance"
  | "departments"
  | "Recrutement"
  | "performance"
  | "formation"
  | "PaiementPage";

// ✅ Menu items avec icônes
const hrMenuItems: { id: HRView; label: string; icon: any }[] = [
  { id: "dashboard", label: "Tableau de Bord", icon: Home },
  { id: "users", label: "Employés", icon: Users },
  { id: "CongesManager", label: "Congés", icon: Calendar },
  { id: "attendance", label: "Pointages", icon: Clock },
  { id: "departments", label: "Départements", icon: Building2 },
  { id: "Recrutement", label: "Recrutements", icon: Users },
  { id: "performance", label: "Performances", icon: TrendingUp },
  { id: "formation", label: "Formations", icon: Award },
  { id: "PaiementPage", label: "Paiements", icon: DollarSign },
];

// Services pour récupérer les données
const API_BASE = "http://localhost:8000/api";

// 🔹 Service pour récupérer les départements
const fetchDepartments = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/departements/getAllDepartements`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data.departements || [];
  } catch (error) {
    console.error("Erreur récupération départements:", error);
    return [];
  }
};

// 🔹 Service pour récupérer les pointages du mois
const fetchMonthlyAttendances = async (year: string, month: string) => {
  try {
    const token = localStorage.getItem("token");
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;
    
    const res = await fetch(`${API_BASE}/pointages/?startDate=${startDate}&endDate=${endDate}`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Erreur récupération pointages:", error);
    return [];
  }
};

// 🔹 Service pour récupérer les performances
const fetchPerformanceData = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/performance/`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      throw new Error(`Erreur ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    return data || [];
  } catch (error) {
    console.error("Erreur récupération performances:", error);
    return [];
  }
};

// 🔹 Service pour récupérer les statistiques globales
const fetchDashboardStats = async () => {
  try {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/dashboard/stats`, {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Authorization": token ? `Bearer ${token}` : "",
      },
    });

    if (!res.ok) {
      // Si l'endpoint n'existe pas, on calcule les stats localement
      return await calculateLocalStats();
    }

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Erreur récupération stats dashboard:", error);
    return await calculateLocalStats();
  }
};

// 🔹 Calcul des statistiques locales si l'API n'est pas disponible
const calculateLocalStats = async () => {
  try {
    const [employees, conges, departments, attendances] = await Promise.all([
      getEmployees(),
      getDemandesConge(),
      fetchDepartments(),
      fetchMonthlyAttendances(new Date().getFullYear().toString(), (new Date().getMonth() + 1).toString().padStart(2, '0'))
    ]);

    // Calcul des présences/absences
    const presentCount = attendances.filter((a: any) => a.statut === 'Présent').length;
    const absentCount = attendances.filter((a: any) => a.statut === 'Absent').length;
    const totalAttendances = attendances.length;
    const presenceRate = totalAttendances > 0 ? Math.round((presentCount / totalAttendances) * 100) : 0;

    return {
      totalEmployees: employees.length,
      activeEmployees: employees.filter((e: any) => e.isActive).length,
      pendingLeaves: conges.filter((c: any) => c.etat === 'en attente').length,
      totalDepartments: departments.length,
      totalLeaves: conges.length,
      approvedLeaves: conges.filter((c: any) => c.etat === 'approuvé').length,
      rejectedLeaves: conges.filter((c: any) => c.etat === 'refusé').length,
      attendanceStats: {
        present: presentCount,
        absent: absentCount,
        total: totalAttendances,
        rate: presenceRate
      },
      departmentStats: departments.map((dept: any) => ({
        name: dept.nom,
        employees: dept.effectif || 0,
        budget: dept.budget || 0
      }))
    };
  } catch (error) {
    console.error("Erreur calcul stats locales:", error);
    return {
      totalEmployees: 0,
      activeEmployees: 0,
      pendingLeaves: 0,
      totalDepartments: 0,
      totalLeaves: 0,
      approvedLeaves: 0,
      rejectedLeaves: 0,
      attendanceStats: { present: 0, absent: 0, total: 0, rate: 0 },
      departmentStats: []
    };
  }
};

// 🔹 Composant Carte Statistique
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  trend?: number;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, trend, color, delay = 0 }) => (
  <div 
    className="bg-white rounded-xl shadow-md p-4 md:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex-1 min-w-[150px]"
    style={{ 
      animationDelay: `${delay * 100}ms`,
      animation: 'fadeInUp 0.6s ease-out forwards',
      opacity: 0,
      transform: 'translateY(20px)'
    } as any}
  >
    <div className="flex items-center justify-between">
      <div className="flex-1">
        <div className="text-xl md:text-2xl font-bold text-gray-800 truncate">{value}</div>
        <div className="text-xs md:text-sm text-gray-500 mt-1 truncate">{label}</div>
        {trend !== undefined && (
          <div className={`text-xs font-medium mt-2 ${trend >= 0 ? 'text-green-500' : 'text-red-500'} hidden sm:block`}>
            {trend >= 0 ? '↗' : '↘'} {Math.abs(trend)}% vs mois dernier
          </div>
        )}
      </div>
      <div className={`p-2 md:p-3 rounded-full ${color} ml-2 flex-shrink-0`}>
        {icon}
      </div>
    </div>
  </div>
);

export const HRDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState<HRView>("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState<boolean>(false);
  const [logoutLoading, setLogoutLoading] = useState<boolean>(false);
  const [unauthorized, setUnauthorized] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // ✅ États pour les données du dashboard
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [departments, setDepartments] = useState<any[]>([]);
  const [attendances, setAttendances] = useState<any[]>([]);
  const [performanceData, setPerformanceData] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [conges, setConges] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  // 🔔 Notifications basées sur les données réelles
  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications = [];
      
      if (dashboardStats?.pendingLeaves > 0) {
        newNotifications.push({
          id: 1,
          type: 'leave',
          message: `${dashboardStats.pendingLeaves} demande(s) de congé en attente de validation`,
          timestamp: new Date(),
          read: false,
          priority: 'high'
        });
      }
      
      if (dashboardStats?.attendanceStats?.rate < 85) {
        newNotifications.push({
          id: 2,
          type: 'attendance',
          message: `Taux de présence faible: ${dashboardStats.attendanceStats.rate}% ce mois-ci`,
          timestamp: new Date(),
          read: false,
          priority: 'medium'
        });
      }
      
      if (departments.some(dept => dept.effectif === 0)) {
        newNotifications.push({
          id: 3,
          type: 'department',
          message: `${departments.filter(dept => dept.effectif === 0).length} département(s) sans employé`,
          timestamp: new Date(),
          read: false,
          priority: 'low'
        });
      }

      // Notification de bienvenue
      newNotifications.push({
        id: 4,
        type: 'info',
        message: `Bienvenue ${user?.prenom} ! Votre tableau de bord est à jour.`,
        timestamp: new Date(),
        read: false,
        priority: 'info'
      });

      setNotifications(newNotifications);
    };

    if (dashboardStats && departments.length > 0) {
      generateNotifications();
    }
  }, [dashboardStats, departments, user]);

  // 🔹 Chargement des données du dashboard
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        const [
          statsData, 
          deptsData, 
          attData, 
          perfData, 
          empData, 
          congeData
        ] = await Promise.all([
          fetchDashboardStats(),
          fetchDepartments(),
          fetchMonthlyAttendances(
            new Date().getFullYear().toString(), 
            (new Date().getMonth() + 1).toString().padStart(2, '0')
          ),
          fetchPerformanceData(),
          getEmployees(),
          getDemandesConge()
        ]);

        setDashboardStats(statsData);
        setDepartments(deptsData);
        setAttendances(attData);
        setPerformanceData(perfData);
        setEmployees(empData);
        setConges(congeData);

      } catch (error) {
        console.error("Erreur chargement dashboard:", error);
        toast.error("Erreur lors du chargement des données");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // 🔐 Déconnexion
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast.error("Impossible de se déconnecter. Réessayez.");
    } finally {
      setLogoutLoading(false);
      setShowUserDropdown(false);
    }
  };

  // Configuration des graphiques avec les données réelles
  const leaveChartData = {
    labels: ['Approuvé', 'Refusé', 'En attente'],
    datasets: [
      {
        data: [
          dashboardStats?.approvedLeaves || 0,
          dashboardStats?.rejectedLeaves || 0,
          dashboardStats?.pendingLeaves || 0
        ],
        backgroundColor: ['#2ecc71', '#e74c3c', '#f39c12'],
        borderWidth: 0,
        borderRadius: 5,
        hoverOffset: 10
      }
    ]
  };

  const leaveChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
          font: {
            size: 12
          }
        }
      }
    },
    cutout: '70%'
  };

  const attendanceChartData = {
    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
    datasets: [
      {
        label: 'Présence',
        data: [95, 92, 88, 90, 85, 70],
        borderColor: '#2ecc71',
        backgroundColor: 'rgba(46, 204, 113, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const attendanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          },
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  const departmentChartData = {
    labels: departments.slice(0, 5).map((dept: any) => dept.nom),
    datasets: [
      {
        label: 'Effectif',
        data: departments.slice(0, 5).map((dept: any) => dept.effectif || 0),
        backgroundColor: '#3498db',
        borderRadius: 5
      }
    ]
  };

  const departmentChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      y: {
        ticks: {
          font: {
            size: 10
          }
        }
      },
      x: {
        ticks: {
          font: {
            size: 10
          }
        }
      }
    }
  };

  // 🔹 Rendu des vues
  const renderViewContent = () => {
    if (unauthorized) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-red-600 text-lg mb-4">Session expirée</div>
          <button
            onClick={handleLogout}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Se reconnecter
          </button>
        </div>
      );
    }

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (activeView) {
      case "dashboard":
        return (
          <div className="space-y-4 md:space-y-6">
            {/* Cartes statistiques en haut */}
            <div className="flex flex-wrap gap-3 md:gap-6 justify-center">
              <div className="flex flex-wrap gap-3 md:gap-6 w-full">
                <StatCard
                  icon={<Users className="h-4 w-4 md:h-6 md:w-6 text-white" />}
                  value={dashboardStats?.totalEmployees || 0}
                  label="Employés Totaux"
                  trend={5}
                  color="bg-blue-500"
                  delay={0}
                />
                
                <StatCard
                  icon={<Building2 className="h-4 w-4 md:h-6 md:w-6 text-white" />}
                  value={dashboardStats?.totalDepartments || 0}
                  label="Départements"
                  trend={2}
                  color="bg-green-500"
                  delay={1}
                />
                
                <StatCard
                  icon={<Calendar className="h-4 w-4 md:h-6 md:w-6 text-white" />}
                  value={dashboardStats?.pendingLeaves || 0}
                  label="Congés en Attente"
                  trend={-3}
                  color="bg-yellow-500"
                  delay={2}
                />
                
                <StatCard
                  icon={<TrendingUp className="h-4 w-4 md:h-6 md:w-6 text-white" />}
                  value={`${dashboardStats?.attendanceStats?.rate || 0}%`}
                  label="Taux de Présence"
                  trend={1}
                  color="bg-purple-500"
                  delay={3}
                />
              </div>
            </div>

            {/* Graphiques détaillés */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {/* Graphique des congés */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" /> 
                  <span className="hidden sm:inline">Répartition des Congés</span>
                  <span className="sm:hidden">Congés</span>
                </h3>
                <div className="h-48 md:h-64">
                  <Doughnut data={leaveChartData} options={leaveChartOptions} />
                </div>
                <div className="grid grid-cols-3 gap-2 md:gap-4 mt-3 md:mt-4">
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-green-600">{dashboardStats?.approvedLeaves || 0}</div>
                    <div className="text-xs md:text-sm text-gray-500">Approuvés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-red-600">{dashboardStats?.rejectedLeaves || 0}</div>
                    <div className="text-xs md:text-sm text-gray-500">Refusés</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg md:text-xl font-bold text-yellow-600">{dashboardStats?.pendingLeaves || 0}</div>
                    <div className="text-xs md:text-sm text-gray-500">En attente</div>
                  </div>
                </div>
              </div>

              {/* Graphique de présence */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" /> 
                  <span className="hidden sm:inline">Tendance des Présences</span>
                  <span className="sm:hidden">Présences</span>
                </h3>
                <div className="h-48 md:h-64">
                  <Line data={attendanceChartData} options={attendanceChartOptions} />
                </div>
                <div className="mt-3 md:mt-4 text-center">
                  <div className="text-xs md:text-sm text-gray-500">
                    Taux moyen: <span className="font-semibold text-green-600">{dashboardStats?.attendanceStats?.rate || 0}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Départements et performances */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
              {/* Effectif par département */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <Building2 className="h-4 w-4 md:h-5 md:w-5" /> 
                  <span className="hidden sm:inline">Effectif par Département</span>
                  <span className="sm:hidden">Départements</span>
                </h3>
                <div className="h-48 md:h-64">
                  <Bar data={departmentChartData} options={departmentChartOptions} />
                </div>
                <div className="mt-3 md:mt-4 space-y-2">
                  {departments.slice(0, 3).map((dept: any) => (
                    <div key={dept._id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-600 truncate mr-2">{dept.nom}</span>
                      <span className="font-semibold flex-shrink-0">{dept.effectif || 0} employé(s)</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Calendrier des événements */}
              <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
                <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4 flex items-center gap-2">
                  <Calendar className="h-4 w-4 md:h-5 md:w-5" /> 
                  <span className="hidden sm:inline">Calendrier du Mois</span>
                  <span className="sm:hidden">Calendrier</span>
                </h3>
                <div className="mb-3 md:mb-4 flex justify-between items-center">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="p-1 md:p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronDown className="h-3 w-3 md:h-4 md:w-4 transform rotate-90" />
                  </button>
                  <h4 className="text-sm md:text-md font-medium text-center mx-2">
                    {currentDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}
                  </h4>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="p-1 md:p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <ChevronDown className="h-3 w-3 md:h-4 md:w-4 transform -rotate-90" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center text-xs md:text-sm">
                  {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map(day => (
                    <div key={day} className="font-medium text-gray-500 py-1 md:py-2">{day}</div>
                  ))}
                  {Array.from({ length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate() }, (_, i) => {
                    const day = i + 1;
                    const hasEvent = conges.some((c: any) => {
                      const congeDate = new Date(c.dateDebut);
                      return congeDate.getDate() === day && 
                             congeDate.getMonth() === currentDate.getMonth() && 
                             congeDate.getFullYear() === currentDate.getFullYear();
                    });
                    
                    return (
                      <div 
                        key={day} 
                        className={`p-1 md:p-2 rounded-lg text-xs md:text-sm ${hasEvent ? 'bg-blue-100 text-blue-700' : 'text-gray-700'} ${day === new Date().getDate() ? 'ring-1 md:ring-2 ring-blue-500' : ''}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Dernières activités */}
            <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
              <h3 className="text-base md:text-lg font-semibold text-gray-800 mb-3 md:mb-4">Dernières Activités</h3>
              <div className="space-y-2 md:space-y-3">
                {conges.slice(0, 5).map((conge: any) => (
                  <div key={conge._id} className="flex items-center justify-between p-2 md:p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 md:space-x-3 flex-1 min-w-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <span className="text-xs md:text-sm truncate">
                        <strong>{conge.employe?.prenom} {conge.employe?.nom}</strong> - {conge.typeConge}
                      </span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ml-2 ${
                      conge.etat === 'approuvé' ? 'bg-green-100 text-green-800' :
                      conge.etat === 'refusé' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {conge.etat}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case "users":
        return <UserManagement />;
      case "CongesManager":
        return <CongesManager />;
      case "attendance":
        return <AttendanceManager />;
      case "departments":
        return <Departments />;
      case "Recrutement":
        return <Recrutement />;
      case "performance":
        return <PerformanceEmployer />;
      case "formation":
        return <SuiviFormations />;
      case "PaiementPage":
        return <PaiementPage />;
      default:
        return <div>Vue non trouvée</div>;
    }
  };

  const getViewTitle = () => {
    const titles: Record<HRView, string> = {
      dashboard: "Tableau de Bord RH",
      users: "Gestion des Employés",
      Recrutement: "Gestion des Recrutements",
      CongesManager: "Validation des Congés",
      attendance: "Gestion des Pointages",
      departments: "Gestion des Départements",
      performance: "Performances",
      formation: "Suivi des Formations",
      PaiementPage: "Gestion de Paiement",
    };
    return titles[activeView] || "Ressources Humaines";
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ToastContainer position="top-right" autoClose={5000} />
      
      <style>{`
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
        
        @keyframes fadeInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .mobile-hidden {
            display: none !important;
          }
          
          .mobile-full-width {
            width: 100% !important;
          }
          
          .mobile-text-center {
            text-align: center !important;
          }
        }

        @media (max-width: 480px) {
          .mobile-small-padding {
            padding: 0.5rem !important;
          }
          
          .mobile-stack {
            flex-direction: column !important;
          }
        }
      `}</style>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-50 transition-all duration-500 ease-in-out ${sidebarCollapsed ? "w-16" : "w-64"} ${isMobileSidebarOpen ? "translate-x-0 shadow-xl" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-3 md:p-4 flex justify-between items-center border-b border-gray-100">
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1 md:p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 hover:scale-110 hidden md:block"
          >
            <Menu className="h-4 w-4 md:h-5 md:w-5 text-gray-800" />
          </button>
          {!sidebarCollapsed && (
            <div className="animate-fadeInRight">
              <h1 className="text-lg md:text-xl font-bold text-gray-800">SGRH</h1>
              <p className="text-xs text-gray-500">Ressources Humaines</p>
            </div>
          )}
          <button 
            onClick={() => setIsMobileSidebarOpen(false)} 
            className="md:hidden p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="mt-4 md:mt-6 flex-1">
          {hrMenuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id);
                  setIsMobileSidebarOpen(false);
                }}
                className={`group w-full flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 text-left transition-all duration-300 ${isActive ? "bg-blue-50 text-blue-600 border-r-4 border-blue-600 shadow-inner" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-r-4 hover:border-gray-300"} ${sidebarCollapsed ? "justify-center" : ""}`}
                title={sidebarCollapsed ? item.label : ""}
                style={{ animationDelay: `${index * 50}ms`, transformOrigin: 'left center' }}
              >
                <Icon className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 transition-all duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"}`} />
                {!sidebarCollapsed && (
                  <span className="font-medium transition-all duration-300 animate-fadeIn text-sm md:text-base">
                    {item.label}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bouton de déconnexion dans la sidebar */}
        <div className="p-3 md:p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className={`group w-full flex items-center space-x-2 md:space-x-3 px-3 py-2 md:px-4 md:py-3 text-left text-gray-700 hover:bg-gray-100 hover:text-red-600 rounded-lg transition-all duration-300 ${sidebarCollapsed ? "justify-center" : ""}`}
            title={sidebarCollapsed ? "Déconnexion" : ""}
            disabled={logoutLoading}
          >
            <LogOut className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110" />
            {!sidebarCollapsed && (
              <span className="font-medium transition-all duration-300 animate-fadeIn text-sm md:text-base">
                {logoutLoading ? "Déconnexion..." : "Déconnexion"}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
  <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? "md:ml-16" : "md:ml-64"}`}>
  <header className="bg-white shadow-sm border-b border-gray-200 px-4 sm:px-4 md:px-6 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
    <div className="flex items-center w-full sm:w-auto justify-between sm:justify-start">
      <div className="flex items-center">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)} 
          className="md:hidden p-2 mr-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 truncate max-w-[200px] sm:max-w-none">
          {getViewTitle()}
        </h1>
      </div>
      
      {/* Bouton notifications version mobile */}
      <div className="sm:hidden relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 hover:bg-gray-100 rounded-lg relative transition-all duration-300"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </button>
      </div>
    </div>

    <div className="flex items-center space-x-2 sm:space-x-3 md:space-x-4 w-full sm:w-auto justify-end">
      {/* Bouton notifications version desktop */}
      <div className="hidden sm:block relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="p-2 hover:bg-gray-100 rounded-lg relative transition-all duration-300"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-gray-600" />
          {unreadNotifications > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
              {unreadNotifications > 99 ? '99+' : unreadNotifications}
            </span>
          )}
        </button>

        {/* Dropdown notifications */}
        {showNotifications && (
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
            <div className="p-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-semibold text-sm md:text-base">Notifications</h3>
              <button 
                onClick={() => setShowNotifications(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                aria-label="Fermer les notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-60 md:max-h-80 overflow-y-auto">
              {notifications.length > 0 ? (
                notifications.map(notification => (
                  <div 
                    key={notification.id} 
                    className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${
                      !notification.read ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => {/* Gérer le clic sur la notification */}}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 h-2 w-2 md:h-3 md:w-3 rounded-full mt-1.5 mr-3 ${
                        !notification.read ? 'bg-blue-500' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm truncate">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm md:text-base">
                  Aucune notification
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200">
              <button className="text-blue-600 text-sm font-medium w-full text-center hover:text-blue-700 transition-colors duration-200">
                Marquer tout comme lu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User profile */}
      <div className="relative">
        <button
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center space-x-2 p-1 sm:p-2 hover:bg-gray-100 rounded-lg transition-all duration-300 min-w-0"
          aria-label="Menu utilisateur"
        >
          <div className="hidden sm:flex flex-col items-end max-w-[120px] md:max-w-none">
            <span className="text-sm font-medium text-gray-800 truncate">
              {user.prenom} {user.nom}
            </span>
            <span className="text-xs text-gray-500 truncate">{user.role}</span>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
            {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
          </div>
          <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform flex-shrink-0 ${
            showUserDropdown ? 'rotate-180' : ''
          }`} />
        </button>

        {showUserDropdown && (
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 animate-fadeIn">
            <div className="p-3 sm:p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-medium flex-shrink-0">
                  {user.prenom?.charAt(0)}{user.nom?.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{user.prenom} {user.nom}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <div className="p-1 sm:p-2">
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-all duration-200 flex items-center">
                <User className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Mon profil</span>
              </button>
              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-all duration-200 flex items-center">
                <Settings className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">Paramètres</span>
              </button>
              <hr className="my-1" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded-md transition-all duration-200 flex items-center text-red-600"
                disabled={logoutLoading}
              >
                <LogOut className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate">
                  {logoutLoading ? "Déconnexion..." : "Se déconnecter"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  </header>

  <div className="p-3 sm:p-4 md:p-6 animate-fadeIn overflow-x-auto">
    {renderViewContent()}
  </div>
</main>

{/* Overlay pour mobile sidebar */}
{isMobileSidebarOpen && (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
    onClick={() => setIsMobileSidebarOpen(false)}
  />
)}
    </div>
  );
};