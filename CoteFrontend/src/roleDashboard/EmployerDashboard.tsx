/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { 
  X,
  PieChart
} from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useCallback } from 'react';
import { getDemandesConge } from "../Components/CongesService";
import { getAttendancesByDate} from "../Components/PointageServices";

const API_BASE = "http://localhost:8000/api";

// Types
interface Employee {
  id: any;
  _id: string;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  departement?: {
    _id: string;
    nom: string;
  };
}

interface DemandeConge {
  _id: string;
  employe: string | Employee;
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  nbJours: number;
  motif?: string;
  etat: string;
  commentaireResponsable?: string;
  dateSoumission: string;
  dateValidation?: string;
}
import React, { useState, useEffect } from 'react';
import {  useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { 
  Menu, 
  LogOut, 
  Bell, 
  ChevronDown,
  Calendar,
  Clock,
  TrendingUp,
  FileText,
  Target
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, RadialLinearScale, Title, Tooltip, Legend } from 'chart.js';
import { Doughnut, Bar, Radar } from 'react-chartjs-2';
import { useAuth } from "../context/AuthContext";
import { getEmployeeStats, type EmployeeStats } from "../Components/ServiceEmployer";

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

// Types
type EmployeeView = 'dashboard' | 'profile' | 'leaves' | 'attendance' | 'goals' | 'payslips';

// Menu items
const employeeMenuItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
  { id: 'leaves', label: 'Mes Congés', icon: Calendar },
  { id: 'attendance', label: 'Mes Présences', icon: Clock },
  { id: 'goals', label: 'Mes Objectifs', icon: Target },
  { id: 'payslips', label: 'Mes Bulletins', icon: FileText },
];

// Composant pour le tableau de bord employé
export const EmployeeDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<EmployeeView>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
const [stats, setStats] = useState<EmployeeStats | null>(null);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
    
 useEffect(() => {
    // Vérifier que l'utilisateur existe
    if (!user?._id) return;

    const fetchStats = async () => {
      try {
        // console.log("Fetching stats pour user:", user.id);
        const data = await getEmployeeStats(user?._id);
        console.log("stats reçues du backend:", data);
        setStats(data);
      } catch (err) {
        console.error("Erreur stats:", err);
      }
    };

    fetchStats();
  }, [user?._id]); 



  // Configuration des graphiques
  const leaveChartData = {
    labels: ['Approuvé', 'Refusé', 'En attente'],
    datasets: [
      {
        data: [stats?.leaves.approved, stats?.leaves.rejected, stats?.leaves.pending],
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
          pointStyle: 'circle'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.label}: ${context.raw} congés`;
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
        label: 'Présence %',
        data: [90, 88, 92, 85, 80, 70],
        backgroundColor: '#2ecc71',
        stack: 'Stack 0'
      },
      {
        label: 'Absence %',
        data: [5, 7, 3, 10, 15, 20],
        backgroundColor: '#e74c3c',
        stack: 'Stack 0'
      },
      {
        label: 'Retard %',
        data: [5, 5, 5, 5, 5, 10],
        backgroundColor: '#f39c12',
        stack: 'Stack 0'
      }
    ]
  };

  const attendanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 15,
          usePointStyle: true,
          pointStyle: 'rect'
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false
      }
    },
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value: any) {
            return value + '%';
          }
        }
      }
    }
  };

  const performanceChartData = {
    labels: ['Ponctualité', 'Efficacité', 'Productivité', 'Engagement'],
    datasets: [
      {
        label: 'Performance',
        data: [
          stats?.performance.ponctuality, 
          stats?.performance.efficiency, 
          stats?.performance.productivity, 
          stats?.performance.engagement
        ],
        backgroundColor: 'rgba(52, 152, 219, 0.2)',
        borderColor: '#3498db',
        pointBackgroundColor: ['#3498db', '#9b59b6', '#2ecc71', '#f1c40f'],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#3498db',
        pointRadius: 5,
        pointHoverRadius: 7
      }
    ]
  };

  const performanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 100,
        ticks: {
          stepSize: 20,
          display: false
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        angleLines: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        pointLabels: {
          font: {
            size: 12,
            weight: 'bold'
          }
        }
      }
    },
    elements: {
      line: {
        borderWidth: 3
      }
    }
  };

  // Vue personnalisée pour le tableau de bord
  const DashboardView = () => (
    <div className="space-y-6">
      {/* Cartes statistiques en haut */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte Congés Totaux */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Congés Totaux</h3>
              <p className="text-sm text-gray-500">Cette année</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-blue-600">{stats?.leaves.total}</div>
            <div className="flex items-center mt-2">
              <div className="text-sm text-green-500 font-medium">
                +5% vs année dernière
              </div>
            </div>
          </div>
        </div>

        {/* Carte Taux de Présence */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Taux de Présence</h3>
              <p className="text-sm text-gray-500">Ce mois-ci</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <Clock className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-green-600">{stats?.attendance.presence}%</div>
            <div className="flex items-center mt-2">
              <div className="text-sm text-green-500 font-medium">
                +2% vs mois dernier
              </div>
            </div>
          </div>
        </div>

        {/* Carte Performance */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Performance</h3>
              <p className="text-sm text-gray-500">Score global</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-purple-600">{stats?.performance.global}%</div>
            <div className="flex items-center mt-2">
              <div className="text-sm text-green-500 font-medium">
                Excellent travail!
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques détaillés */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Carte Congé */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" /> Détail des Congés
          </h2>
          <div className="h-64">
            <Doughnut data={leaveChartData} options={leaveChartOptions} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-blue-500">{stats?.leaves.total}</div>
              <div className="text-xs text-gray-500">Total Congés</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-500">{stats?.leaves.approved}</div>
              <div className="text-xs text-gray-500">Approuvé</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-500">{stats?.leaves.rejected}</div>
              <div className="text-xs text-gray-500">Refusé</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats?.leaves.pending}</div>
              <div className="text-xs text-gray-500">En attente</div>
            </div>
          </div>
        </div>

        {/* Carte Pointage */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Clock className="h-5 w-5" /> Détail du Pointage
          </h2>
          <div className="h-64">
            <Bar data={attendanceChartData} options={attendanceChartOptions} />
          </div>
          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-500">{stats?.attendance.presence}%</div>
              <div className="text-xs text-gray-500">Présence</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-red-500">{stats?.attendance.absence}%</div>
              <div className="text-xs text-gray-500">Absence</div>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-yellow-500">{stats?.attendance.delay}%</div>
              <div className="text-xs text-gray-500">Retard</div>
            </div>
          </div>
        </div>

        {/* Carte Performance */}
        <div className="bg-white rounded-xl shadow-md p-6 transition-transform hover:-translate-y-1">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" /> Détail de la Performance
          </h2>
          <div className="h-64">
            <Radar data={performanceChartData} options={performanceChartOptions} />
          </div>
          <div className="text-center mt-4">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              {stats?.performance.global}%
            </div>
            <div className="text-sm text-gray-500">Score Global</div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <DashboardView />;
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

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full bg-white shadow-lg border-r border-gray-200 z-40 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} ${isMobile && !sidebarCollapsed ? 'ml-0' : ''}`}>
        <div className="p-4 flex items-center space-x-3">
          <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Menu className="h-5 w-5 text-gray-800" />
          </button>
          {!sidebarCollapsed && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">MON ESPACE</h1>
              <p className="text-xs text-gray-500">Employé</p>
            </div>
          )}
        </div>

        <nav className="mt-6">
          {employeeMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveView(item.id as EmployeeView);
                  if (isMobile) setSidebarCollapsed(true);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left transition-colors ${isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'}`}
                title={sidebarCollapsed ? item.label : ''}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200">
          <button onClick={handleLogout} disabled={logoutLoading} className="w-full flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
            {logoutLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div> : <LogOut className="h-5 w-5" />}
            {!sidebarCollapsed && <span>{logoutLoading ? 'Déconnexion...' : 'Déconnexion'}</span>}
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isMobile && !sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}

      <main className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'} ${isMobile ? 'ml-0' : ''}`}>
        <header className="bg-white shadow-sm border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-gray-800">{getViewTitle()}</h1>
              <p className="text-sm text-gray-600">Bonjour, {user.prenom} {user.nom}</p>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"><Bell className="h-5 w-5" /></button>
              <div className="relative">
                <button onClick={() => setShowUserDropdown(!showUserDropdown)} className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">{user.prenom?.[0]}{user.nom?.[0]}</span>
                  </div>
                  <div className="text-left hidden md:block">
                    <div className="text-sm font-medium text-gray-900">{user.prenom} {user.nom}</div>
                    <div className="text-xs text-gray-500 capitalize">{user.role}</div>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </button>
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <div className="text-sm font-medium text-gray-900">{user.prenom} {user.nom}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                    <div className="py-1">
                      <button onClick={() => { setActiveView('profile'); setShowUserDropdown(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Mon profil</button>
                      <button className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Paramètres</button>
                    </div>
                    <div className="border-t border-gray-200 py-1">
                      <button onClick={handleLogout} disabled={logoutLoading} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2 disabled:opacity-50">
                        {logoutLoading ? <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div> : <LogOut className="h-4 w-4" />}
                        <span>{logoutLoading ? 'Déconnexion...' : 'Déconnexion'}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 md:p-6 overflow-x-auto">{renderView()}</div>
      </main>
    </div>
  );
};


const EmployeeOverview: React.FC = () => {
  const { user } = useAuth();
  const [conges, setConges] = useState<DemandeConge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConges = async () => {
      try {
        const demandesData = await getDemandesConge();
        // Filtrer pour n'avoir que les congés de l'employé connecté
        const userConges = demandesData.filter(conge => {
          const employeId = typeof conge.employe === 'string' ? conge.employe : conge.employe._id;
          return employeId === user?.id;
        });
        setConges(userConges);
      } catch (err: any) {
        console.error(err);
        toast.error("Erreur lors de la récupération des congés");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      fetchConges();
    }
  }, [user]);

  // Calculer les statistiques des congés
  const totalConges = conges.length;
  const congesApprouves = conges.filter(c => c.etat?.toLowerCase() === "approuvé").length;
  const congesEnAttente = conges.filter(c => c.etat?.toLowerCase() === "en attente").length;
  const congesRefuses = conges.filter(c => c.etat?.toLowerCase() === "refusé").length;

  // Calculer la répartition par type de congé
  const typeCongeStats = conges.reduce((acc, conge) => {
    const type = conge.typeConge || 'Non spécifié';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Préparer les données pour le diagramme
  const chartData = Object.entries(typeCongeStats).map(([type, count], index) => {
    const colors = ['#3B82F6', '#10B981', '#EF4444', '#F59E0B', '#8B5CF6'];
    return {
      type,
      count,
      color: colors[index % colors.length],
      percentage: totalConges > 0 ? Math.round((count / totalConges) * 100) : 0
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { icon: Calendar, bg: 'bg-green-500', value: totalConges, label: 'Total congés' },
          { icon: Award, bg: 'bg-blue-500', value: congesApprouves, label: 'Congés approuvés' },
          { icon: Clock, bg: 'bg-yellow-500', value: congesEnAttente, label: 'En attente' },
          { icon: X, bg: 'bg-red-500', value: congesRefuses, label: 'Congés refusés' },
        ].map((card, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{card.value}</p>
                <p className="text-sm text-gray-500">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Diagramme de répartition des congés */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Répartition des congés par type</h3>
            <PieChart className="h-5 w-5 text-gray-500" />
          </div>
          
          {totalConges === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucun congé enregistré</p>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="flex-1">
                <div className="space-y-3">
                  {chartData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                        <span className="text-sm font-medium text-gray-700">{item.type}</span>
                      </div>
                      <span className="text-sm text-gray-500">{item.count} ({item.percentage}%)</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative w-40 h-40">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  {chartData.reduce((acc, item, index) => {
                    const circumference = 2 * Math.PI * 40;
                    const strokeDasharray = (item.percentage / 100) * circumference;
                    const strokeDashoffset = acc.offset;
                    
                    acc.elements.push(
                      <circle
                        key={index}
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={item.color}
                        strokeWidth="8"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        transform="rotate(-90 50 50)"
                      />
                    );
                    
                    acc.offset -= strokeDasharray;
                    return acc;
                  }, { elements: [] as JSX.Element[], offset: circumference }).elements}
                  
                  <text x="50" y="50" textAnchor="middle" dy="0.3em" fontSize="12" fontWeight="bold" fill="#374151">
                    {totalConges}
                  </text>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Derniers congés */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dernières demandes de congé</h3>
          
          {conges.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Aucune demande de congé</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conges.slice(0, 3).map((conge) => {
                const dateDebut = new Date(conge.dateDebut);
                const dateFin = new Date(conge.dateFin);
                const duree = Math.ceil((dateFin.getTime() - dateDebut.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                
                let badgeColor = "";
                if (conge.etat?.toLowerCase() === "approuvé") {
                  badgeColor = "bg-green-100 text-green-800";
                } else if (conge.etat?.toLowerCase() === "refusé") {
                  badgeColor = "bg-red-100 text-red-800";
                } else if (conge.etat?.toLowerCase() === "en attente") {
                  badgeColor = "bg-yellow-100 text-yellow-800";
                } else {
                  badgeColor = "bg-gray-100 text-gray-800";
                }

                return (
                  <div key={conge._id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-800">{conge.typeConge}</p>
                        <p className="text-sm text-gray-600">
                          {dateDebut.toLocaleDateString('fr-FR')} - {dateFin.toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeColor}`}>
                        {conge.etat}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{duree} jour{duree > 1 ? 's' : ''}</p>
                  </div>
                );
              })}
              
              {conges.length > 3 && (
                <div className="text-center pt-2">
                  <button 
                    onClick={() => window.location.hash = '#leaves'}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Voir tous mes congés
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EmployeeProfile: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Informations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <p className="text-gray-800">{user.prenom} {user.nom}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Matricule</label>
            <p className="text-gray-800">{user.employer?.matricule || 'Non attribué'}</p>
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

// Service pour créer un congé
const creerConge = async (data: any) => {
  const res = await axios.post(`${API_BASE}/conges/creerConge`, data, { withCredentials: true });
  return res.data;
};

// Composant EmployeeLeaves
const EmployeeLeaves: React.FC = () => {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [conges, setConges] = useState<DemandeConge[]>([]);
  const [formData, setFormData] = useState({
    typeConge: "",
    dateDebut: "",
    dateFin: "",
    motif: "",
  });

  useEffect(() => {
    const fetchConges = async () => {
      try {
        const demandesData = await getDemandesConge();
        setConges(demandesData);
      } catch (err: any) {
        console.error(err);
        toast.error("Erreur lors de la récupération des congés");
      }
    };

    fetchConges();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const employeId = user?.employer?._id;
    if (!employeId) {
      toast.error("Impossible de récupérer l'identifiant de l'employé");
      setLoading(false);
      return;
    }

    try {
      const requestData = {
        employeId,
        typeConge: formData.typeConge,
        dateDebut: formData.dateDebut,
        dateFin: formData.dateFin,
        raison: formData.motif,
      };

      const res = await creerConge(requestData);

      if (res.conge) {
        toast.success("Demande de congé soumise !");
        setFormData({ typeConge: "", dateDebut: "", dateFin: "", motif: "" });
        setShowForm(false);
        setConges(prev => [...prev, res.conge]);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !user.employer) {
    return <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200 text-gray-700">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
          <h3 className="text-lg font-semibold text-gray-800">Mes Demandes de Congé</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            disabled={loading}
          >
            {showForm ? (
              <>
                <X className="h-4 w-4 mr-1" /> Annuler
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-1" /> Nouvelle demande
              </>
            )}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouvelle Demande de Congé</h3>
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Matricule:</strong> {user.employer.matricule || "Non attribué"}
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
                />
              </div>

              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Soumettre la demande"}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8">
          <h4 className="text-lg font-bold text-gray-800 mb-6">Historique de mes congés</h4>

          {conges.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="mt-4 text-sm font-medium text-gray-900">Aucun congé enregistré</h3>
              <p className="mt-1 text-sm text-gray-500">Vous n'avez fait aucune demande de congé pour le moment.</p>
            </div>
          ) : (
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durée
                      </th>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        État
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conges.map((c) => {
                      const dateDebut = new Date(c.dateDebut);
                      const dateFin = new Date(c.dateFin);
                      const duree = Math.ceil((dateFin - dateDebut) / (1000 * 60 * 60 * 24)) + 1;
                      
                      let badgeColor = "";
                      if (c.etat?.toLowerCase() === "approuvé") {
                        badgeColor = "bg-green-100 text-green-800";
                      } else if (c.etat?.toLowerCase() === "refusé") {
                        badgeColor = "bg-red-100 text-red-800";
                      } else if (c.etat?.toLowerCase() === "en attente") {
                        badgeColor = "bg-yellow-100 text-yellow-800";
                      } else {
                        badgeColor = "bg-gray-100 text-gray-800";
                      }

                      return (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{c.typeConge}</div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">{c.motif}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {new Date(c.dateDebut).toLocaleDateString('fr-FR')} 
                              <span className="text-gray-400 mx-1">→</span>
                              {new Date(c.dateFin).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{duree} jour{duree > 1 ? 's' : ''}</div>
                          </td>
                          <td className="px-4 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeColor}`}>
                              {c.etat}
                            </span>
                            <div className="text-sm text-gray-500 mt-1 max-w-xs truncate">
                              {c.commentaireResponsable || <span className="text-gray-400">-</span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface EmployeeAttendanceProps {
  days?: number;
}
// Types adaptés au front
export interface AttendanceRecord {
  employe: any; // ou un type `User` si tu en as un
  date: string;
  statut: "Présent" | "Absent";
  heureArrivee: string;
  heureDepart: string;
  heuresTravaillees: string;
  retard: string;
}

export interface AttendanceApiResponse {
  attendance?: {
    presence: number;
    delay?: number;
    heureArrivee?: string;
    heureDepart?: string;
  };
}



export const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = ({ days = 7 }) => {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // 📌 Charger l’historique des présences
const fetchAttendanceHistory = useCallback(async () => {
  if (!user?._id) {
    setError("Utilisateur non défini");
    setAttendanceHistory([]);
    setLoading(false);
    return;
  }

  setLoading(true);
  try {
    const history: AttendanceRecord[] = [];

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString("fr-CA");

      // ✅ Appel API qui retourne AttendanceApiResponse
      const res = await getAttendancesByDate(dateStr);

      const record: AttendanceRecord = {
        employe: user,
        date: dateStr,
        statut: res.attendance?.presence && res.attendance.presence > 0 ? "Présent" : "Absent",
        heureArrivee: res.attendance?.heureArrivee || "-",
        heureDepart: res.attendance?.heureDepart || "-",
        heuresTravaillees: res.attendance?.presence ? `${res.attendance.presence} h` : "0h",
        retard: res.attendance?.delay ? `${res.attendance.delay} min` : "-",
      };

      history.push(record);
    }

    setAttendanceHistory(history);
    setError(null);
  } catch (err) {
    console.error(err);
    setError("Erreur lors du chargement des présences");
  } finally {
    setLoading(false);
  }
}, [user, days]);


  useEffect(() => {
    if (user?._id) fetchAttendanceHistory();
  }, [fetchAttendanceHistory, user]);

  // 📌 Pointer arrivée
  const handleMarkArrival = async () => {
    if (!user?._id) return;
    try {
      const todayStr = new Date().toLocaleDateString("fr-CA");
      await axios.put("/api/attendance/arrivee", {
        employeId: user._id,
        date: todayStr,
        checked: true,
      });
      toast.success("Arrivée pointée avec succès");
      fetchAttendanceHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors du pointage d'arrivée");
    }
  };

  // 📌 Pointer départ
  const handleMarkDeparture = async () => {
    if (!user?._id) return;
    try {
      const todayStr = new Date().toLocaleDateString("fr-CA");
      await axios.put("/api/attendance/depart", {
        employeId: user._id,
        date: todayStr,
      });
      toast.success("Départ pointé avec succès");
      fetchAttendanceHistory();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Erreur lors du pointage de départ");
    }
  };

  if (loading) return <p>Chargement des présences...</p>;
  if (!user) return <p className="text-red-500">Veuillez vous connecter pour voir vos présences.</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  const todayStr = new Date().toLocaleDateString("fr-CA");
  const todayRecord = attendanceHistory.find((r) => r.date === todayStr) || {
    employe: user,
    date: todayStr,
    statut: "Absent",
    heureArrivee: "-",
    heureDepart: "-",
    heuresTravaillees: "-",
    retard: "-",
  };

  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toLocaleDateString("fr-CA");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString("fr-CA");

    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterdayStr) return "Hier";

    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Présences</h3>

        {/* Boutons arrivée & départ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={handleMarkArrival}
            disabled={todayRecord.heureArrivee !== "-"}
            className={`p-4 rounded-lg transition-colors flex flex-col items-center ${
              todayRecord.heureArrivee !== "-" ? "bg-gray-50 cursor-not-allowed" : "bg-green-50 hover:bg-green-100"
            }`}
          >
            <Clock className="h-8 w-8 text-green-600 mb-2" />
            <h4 className="font-medium text-gray-800">Pointer l'arrivée</h4>
            <p className="text-sm text-gray-600">{todayRecord.heureArrivee}</p>
          </button>

          <button
            onClick={handleMarkDeparture}
            disabled={todayRecord.heureArrivee === "-" || todayRecord.heureDepart !== "-"}
            className={`p-4 rounded-lg transition-colors flex flex-col items-center ${
              todayRecord.heureArrivee === "-" ? "bg-gray-50 cursor-not-allowed" : "bg-red-50 hover:bg-red-100"
            }`}
          >
            <Clock className="h-8 w-8 text-red-600 mb-2" />
            <h4 className="font-medium text-gray-800">Pointer le départ</h4>
            <p className="text-sm text-gray-600">{todayRecord.heureDepart}</p>
          </button>
        </div>

        {/* Historique */}
        <div className="space-y-3">
          {attendanceHistory.map((record) => (
            <div key={record.date} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm text-gray-600">{formatDateLabel(record.date)}</span>
              <span className="text-sm font-medium text-gray-800">
                {record.heureArrivee !== "-"
                  ? `${record.heureArrivee} - ${record.heureDepart !== "-" ? record.heureDepart : "En cours"}`
                  : "Non pointé"}{" "}
                ({record.heuresTravaillees !== "-" ? record.heuresTravaillees : "0h"})
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const EmployeeGoals: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Bulletins de Paie</h3>
        <div className="space-y-3">
          {[
            { month: 'Juin 2024', amount: '3,200€', status: 'Payé' },
            { month: 'Mai 2024', amount: '3,200€', status: 'Payé' },
            { month: 'Avril 2024', amount: '3,200€', status: 'Payé' },
            { month: 'Mars 2024', amount: '3,200€', status: 'Payé' }
          ].map((payslip, index) => (
            <div key={index} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-gray-50 rounded-lg gap-2">
              <div>
                <h4 className="font-medium text-gray-800">{payslip.month}</h4>
                <p className="text-sm text-gray-600">Salaire net: {payslip.amount}</p>
              </div>
              <div className="flex items-center space-x-3 self-end sm:self-auto">
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

export default EmployeeDashboard;

