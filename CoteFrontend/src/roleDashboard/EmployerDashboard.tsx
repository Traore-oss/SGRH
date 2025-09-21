/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { 
  X,
  PieChart,
  Plus
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
          return employeId === user?._id;
        });
        setConges(userConges);
      } catch (err: any) {
        console.error(err);
        toast.error("Erreur lors de la récupération des congés");
      } finally {
        setLoading(false);
      }
    };

    if (user?._id) {
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

interface DemandeConge {
  _id: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  motif: string;
  etat: string;
  commentaireResponsable?: string;
}

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

  const calculateDuration = (dateDebut: string, dateFin: string): number => {
    const start = new Date(dateDebut);
    const end = new Date(dateFin);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  };

  const getStatusBadge = (etat: string) => {
    const status = etat?.toLowerCase();
    if (status === "approuvé") {
      return "bg-green-100 text-green-700 border-green-200";
    } else if (status === "refusé") {
      return "bg-red-100 text-red-700 border-red-200";
    } else if (status === "en attente") {
      return "bg-yellow-100 text-yellow-700 border-yellow-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  if (!user || !user.employer) {
    return <div className="p-6 bg-white rounded-xl shadow-md border border-gray-100 text-gray-700">Chargement...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mes Demandes de Congé</h1>
            <p className="text-gray-500 mt-1">Gérez vos demandes de congé et consultez leur statut</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-lg hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
            disabled={loading}
          >
            {showForm ? (
              <>
                <X className="h-5 w-5" /> Annuler
              </>
            ) : (
              <>
                <Plus className="h-5 w-5" /> Nouvelle demande
              </>
            )}
          </button>
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8 animate-fade-in">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Nouvelle Demande de Congé</h3>
            
            <div className="mb-5 p-4 bg-blue-50 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-800 font-medium">
                <span className="font-semibold">Matricule:</span> {user.employer.matricule || "Non attribué"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type de congé</label>
                  <select
                    id="typeConge"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date début</label>
                  <input
                    type="date"
                    id="dateDebut"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                    value={formData.dateDebut}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date fin</label>
                  <input
                    type="date"
                    id="dateFin"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    required
                    value={formData.dateFin}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Motif</label>
                <textarea
                  id="motif"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  rows={3}
                  value={formData.motif}
                  onChange={handleInputChange}
                  required
                  placeholder="Décrivez la raison de votre demande de congé"
                />
              </div>

              <button
                type="submit"
                className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-md disabled:opacity-50"
                disabled={loading}
              >
                {loading ? "Envoi en cours..." : "Soumettre la demande"}
              </button>
            </form>
          </div>
        )}

        {/* Leaves History */}
        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Historique de mes congés</h2>

          {conges.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-200">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun congé enregistré</h3>
              <p className="text-gray-500">Vous n'avez fait aucune demande de congé pour le moment.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Période
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Durée
                      </th>
                      <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        État
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {conges.map((c) => {
                      const duree = calculateDuration(c.dateDebut, c.dateFin);
                      
                      return (
                        <tr key={c._id} className="hover:bg-gray-50 transition-colors duration-150">
                          <td className="px-6 py-5">
                            <div className="text-sm font-semibold text-gray-900">{c.typeConge}</div>
                            <div className="text-sm text-gray-500 mt-1 max-w-xs">{c.motif}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm text-gray-900">
                              {new Date(c.dateDebut).toLocaleDateString('fr-FR')} 
                              <span className="text-gray-400 mx-2">→</span>
                              {new Date(c.dateFin).toLocaleDateString('fr-FR')}
                            </div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-sm font-medium text-gray-700">{duree} jour{duree > 1 ? 's' : ''}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${getStatusBadge(c.etat)}`}>
                              {c.etat}
                            </span>
                            {c.commentaireResponsable && (
                              <div className="text-sm text-gray-500 mt-2 max-w-xs">
                                {c.commentaireResponsable}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {conges.map((c) => {
                  const duree = calculateDuration(c.dateDebut, c.dateFin);
                  
                  return (
                    <div key={c._id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">{c.typeConge}</h3>
                        <span className={`inline-flex px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadge(c.etat)}`}>
                          {c.etat}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-500 mb-3">{c.motif}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Période</p>
                          <p className="font-medium text-gray-900">
                            {new Date(c.dateDebut).toLocaleDateString('fr-FR')} 
                            <span className="text-gray-400 mx-1">→</span>
                            {new Date(c.dateFin).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-gray-500">Durée</p>
                          <p className="font-medium text-gray-900">{duree} jour{duree > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      {c.commentaireResponsable && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-sm text-gray-500">Commentaire</p>
                          <p className="text-sm text-gray-700">{c.commentaireResponsable}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

/* eslint-disable react-refresh/only-export-components */
export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: "Admin" | "RH" | "Employe";
  isActive: boolean;
  departement?: string;
  matricule?: string; // ✅ doit correspondre exactement
  employer?: any;
}


export interface AttendanceRecord {
  employe: Employee;
  date: string;
  statut: "Présent" | "Absent" | "Retard";
  heureArrivee: string;
  heureDepart: string;
  heuresTravaillees: string;
  retard?: string;
}

interface EmployeeAttendanceProps {
  days?: number;
}

export const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = ({ days = 7 }) => {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Formater heure "HH:mm:ss" -> "HH:mm"
  const formatTime = (time?: string) => {
    if (!time || time === "-") return "-";
    const parts = time.split(":");
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return time;
  };

  // 🔹 Récupération de l'historique
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
      const now = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // 🔹 Appel backend pour récupérer tous les pointages du jour
        const res: AttendanceRecord[] = await getAttendancesByDate(dateStr);

        // 🔹 Chercher le pointage de l'utilisateur courant
        const userRecord = res.find(
          (r) => r.employe._id.toString() === user._id.toString()
        );

        const record: AttendanceRecord = {
          employe: user,
          date: dateStr,
          statut: userRecord?.statut || "Absent",
          heureArrivee:
            userRecord?.heureArrivee && userRecord.heureArrivee !== "-"
              ? formatTime(userRecord.heureArrivee)
              : "-",
          heureDepart:
            userRecord?.heureDepart && userRecord.heureDepart !== "-"
              ? formatTime(userRecord.heureDepart)
              : "-",
          heuresTravaillees:
            userRecord?.heuresTravaillees && userRecord.heuresTravaillees !== "-"
              ? userRecord.heuresTravaillees
              : "0h",
          retard:
            userRecord?.retard && userRecord.retard !== "-"
              ? userRecord.retard
              : "-",
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

  // Formatage des dates
  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterdayStr) return "Hier";

    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Obtenir la classe de couleur en fonction du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Présent":
        return "bg-green-100 text-green-800";
      case "Absent":
        return "bg-red-100 text-red-800";
      case "Retard":
        return "bg-yellow-100 text-yellow-800";
      case "Congé":
        return "bg-blue-100 text-blue-800";
      case "Télétravail":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Afficher un indicateur de chargement stylisé
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
        <span className="ml-3 text-gray-600">Chargement des présences...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Veuillez vous connecter pour voir vos présences.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>{error}</p>
        <button
          onClick={fetchAttendanceHistory}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Mes Présences ({days} derniers jours)
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-6 py-3 text-left">Date</th>
                <th className="px-6 py-3 text-center">Arrivée</th>
                <th className="px-6 py-3 text-center">Départ</th>
                <th className="px-6 py-3 text-center">Heures travaillées</th>
                <th className="px-6 py-3 text-center">Retard</th>
                <th className="px-6 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendanceHistory.map((record, index) => (
                <tr key={record.date} className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateLabel(record.date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                    {record.heureArrivee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                    {record.heureDepart}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                    {record.heuresTravaillees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {record.retard !== "-" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        {record.retard}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.statut)}`}>
                      {record.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {attendanceHistory.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="mt-4 text-gray-500">Aucune donnée de présence disponible</p>
          </div>
        )}
      </div>
    </div>
  );
};



import { type Performance } from "../Components/ServicePerformance"; // ← utilise ton service centralisé

interface Goal {
  _id: string;
  objectif: string;
  realisation: "Non démarré" | "En cours" | "Terminé";
  evaluation: string;
  createdAt: string;
  employe: {
    _id: string;
    nom: string;
    prenom: string;
  };
}

// Convertit le statut en pourcentage pour la barre de progression
const realisationToPercent = (realisation: Goal["realisation"]) => {
  switch (realisation) {
    case "Non démarré": return 0;
    case "En cours": return 50;
    case "Terminé": return 100;
    default: return 0;
  }
};

export const EmployeeGoals: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?._id) return;

    const fetchGoals = async () => {
      setLoading(true);
      setError(null);

      try {
        // ✅ Utilisation de API_BASE défini dans ton service
        const res = await axios.get<Performance[]>(`${API_BASE}/performances`, {
          withCredentials: true,
        });

        console.log("⚡ Résultat API /performances :", res.data);

        // Filtrer les performances si le backend renvoie plus de données
        const data: Goal[] = res.data.map((perf) => ({
          _id: perf._id!,
          objectif: perf.objectif,
          realisation: perf.realisation,
          evaluation: perf.evaluation,
          createdAt: perf.createdAt!,
          employe: typeof perf.employe === "string"
            ? { _id: perf.employe, nom: "", prenom: "" }
            : {
                _id: perf.employe._id,
                nom: perf.employe.nom,
                prenom: perf.employe.prenom,
              },
        }));

        setGoals(data);
      } catch (err: any) {
        console.error("Erreur récupération des performances :", err);
        setError("Impossible de récupérer les performances.");
        setGoals([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGoals();
  }, [user]);

  if (authLoading || loading) return <div>Chargement des objectifs...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!goals.length) return <div>Aucun objectif trouvé.</div>;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Mes Objectifs</h3>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal._id} className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-800">{goal.objectif}</h4>
                <span className="text-sm text-blue-600 font-medium">{goal.evaluation}</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${realisationToPercent(goal.realisation)}%` }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Créé le: {new Date(goal.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Employé: {goal.employe.nom} {goal.employe.prenom}
              </p>
            </div>
          ))}
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

