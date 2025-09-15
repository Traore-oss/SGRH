 
"use client"
import type React from "react"
import { useNavigate } from "react-router-dom"
import { User, Plus, Eye, Edit, Lock, Filter, ChevronDown, Search } from "lucide-react"
import { Users, Building2, FileText, Calendar, Clock, Menu, LogOut, Bell, Heart, UserPlus } from "lucide-react"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAuth } from "../context/AuthContext"
import { getEmployees, type Employee } from "../Components/ServiceEmployer"
import { Dashboard } from "../pages/Dashboard"
import { CongesManager } from "../pages/Conges"
import  AttendanceManager from "../pages/Pointages"
import { Departments } from "../pages/Departement"
import { PerformanceEmployer } from "../pages/Performance"
import { Reports } from "../pages/Rapport"
import { EmployeeForm } from "../forms/EmployeeForm"
import SuiviFormations from "../pages/Formation"
import { useState, useEffect } from "react"
import { Modal } from "../commons/Modal"

type HRView =
  | "dashboard"
  | "users"
  | "CongesManager"
  | "attendance"
  | "departments"
  | "reports"
  | "recruitment"
  | "performance"
  | "formation"

const hrMenuItems = [
  { id: "dashboard", label: "Tableau de Bord", icon: Heart },
  { id: "users", label: "Utilisateurs", icon: Users },
  { id: "recruitment", label: "Recrutement", icon: UserPlus },
  { id: "CongesManager", label: "Congés", icon: Calendar },
  { id: "attendance", label: "Présences", icon: Clock },
  { id: "performance", label: "Performances", icon: FileText },
  { id: "departments", label: "Départements", icon: Building2 },
  { id: "formation", label: "Suivi des Formations", icon: FileText },
  { id: "reports", label: "Rapports RH", icon: FileText },
]

// Composant StatCard pour afficher les statistiques
interface StatCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: {
    value: number
    isPositive: boolean
  }
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
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
)

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
      case "recruitment":
        return <RecruitmentManagement />
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
      employees: "Gestion des Employés",
      recruitment: "Gestion du Recrutement",
      CongesManager: "Validation des Congés",
      attendance: "Suivi des Présences",
      departments: "Organisation",
      reports: "Rapports RH",
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

      {/* Sidebar RH en blanc */}-
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
    </div>
  )
}

// Composant de gestion du recrutement (RH)
const RecruitmentManagement: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-500">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">12</p>
              <p className="text-sm text-gray-500">Offres actives</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-500">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">45</p>
              <p className="text-sm text-gray-500">Candidatures</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-500">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">8</p>
              <p className="text-sm text-gray-500">Entretiens</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-purple-500">
              <UserPlus className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-800">3</p>
              <p className="text-sm text-gray-500">Embauches</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Processus de Recrutement</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Développeur Full Stack</h4>
              <p className="text-sm text-gray-600">15 candidatures • 3 entretiens planifiés</p>
            </div>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Gérer
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">Assistant RH</h4>
              <p className="text-sm text-gray-600">8 candidatures • 2 entretiens terminés</p>
            </div>
            <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
              Gérer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant pour afficher la gestion des employés avec les fonctionnalités complètes
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
)

export const UserManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [selectedUser, setSelectedUser] = useState<Employee | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000"

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      console.log("Début du chargement des employés...")
      const data = await getEmployees()
      console.log("Employés chargés:", data)
      setEmployees(data)
    } catch (error) {
      console.error("Erreur lors du chargement des employés:", error)
      toast.error("Erreur lors du chargement des employés")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEmployees()
  }, [])

  const toggleActive = async (userId: string, isActive: boolean, userName: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/Auth/toggleActive/${userId}`, {
        method: "PATCH",
        credentials: "include",
      })

      if (!res.ok) throw new Error("Erreur lors du changement de statut")

      // Mettre à jour localement la liste des employés
      setEmployees((prev) => prev.map((emp) => (emp._id === userId ? { ...emp, isActive: !isActive } : emp)))

      toast.success(`Utilisateur ${userName} ${isActive ? "désactivé" : "activé"} avec succès`)
    } catch (err) {
      console.error(err)
      toast.error("Impossible de changer l'état de l'utilisateur.")
    }
  }

  const calculateSeniority = (dateEmbauche: string): string => {
    if (!dateEmbauche) return "Non défini"

    const embauche = new Date(dateEmbauche)
    const maintenant = new Date()
    const diffTime = Math.abs(maintenant.getTime() - embauche.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)

    if (years > 0) {
      return `${years} an${years > 1 ? "s" : ""} ${months > 0 ? `et ${months} mois` : ""}`
    } else if (months > 0) {
      return `${months} mois`
    } else {
      return `${diffDays} jour${diffDays > 1 ? "s" : ""}`
    }
  }

  // Statistiques
  const totalEmployees = employees.length
  const activeEmployees = employees.filter((e) => e.isActive).length
  const inactiveEmployees = employees.filter((e) => !e.isActive).length

  // Filtrage par rôle
  const roles = Array.from(new Set(employees.map((e) => e.role).filter(Boolean))) as string[]

  const filteredEmployees = employees.filter((e) => {
    const matchesSearch =
      (e.nom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.prenom || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.matricule || "").toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && e.isActive) ||
      (statusFilter === "inactive" && !e.isActive)

    const matchesRole = roleFilter === "all" || e.role === roleFilter

    return matchesSearch && matchesStatus && matchesRole
  })

  const displayStatut = (u: Employee) => (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {u.isActive ? "Actif" : "Inactif"}
    </span>
  )

  const getRoleBadgeClass = (role: string) => {
    switch (role?.toLowerCase()) {
      case "admin":
        return "bg-purple-100 text-purple-800"
      case "employé":
        return "bg-green-100 text-green-800"
      case "rh":
        return "bg-pink-100 text-pink-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "GNF",
      minimumFractionDigits: 0,
    }).format(amount)
  }

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
          value={new Set(employees.map((e) => e.departement?.nom).filter(Boolean)).size}
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
                onChange={(e) => setSearchTerm(e.target.value)}
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
                          onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive")}
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
                          onChange={(e) => setRoleFilter(e.target.value)}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                        >
                          <option value="all">Tous les rôles</option>
                          {roles.map((role) => (
                            <option key={role} value={role}>
                              {role}
                            </option>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Poste
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Département
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                    Salaire
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Rôle
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployees.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {u.prenom?.[0]}
                            {u.nom?.[0]}
                          </span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {u.prenom} {u.nom}
                          </div>
                          <div className="text-sm text-gray-500">{u.matricule || "-"}</div>
                          <div className="text-xs text-gray-400 lg:hidden">{u.email || "-"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm text-gray-900">{u.email || "-"}</div>
                      <div className="text-sm text-gray-500">{u.telephone || "-"}</div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="text-sm text-gray-900">{u.poste || "-"}</div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{u.departement?.nom || "-"}</div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <div className="text-sm text-gray-900">{u.salaire ? formatCurrency(Number(u.salaire)) : "-"}</div>
                    </td>
                    <td className="px-4 py-3">{displayStatut(u)}</td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeClass(u.role || "")}`}>
                        {u.role || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-1">
                        <button
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          onClick={() => {
                            setSelectedUser(u)
                            setShowViewModal(true)
                          }}
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"
                          onClick={() => {
                            setSelectedUser(u)
                            setShowEditModal(true)
                          }}
                          title="Modifier"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          className={`p-2 rounded-lg transition-colors ${
                            u.isActive ? "text-red-500 hover:bg-red-50" : "text-green-500 hover:bg-green-50"
                          }`}
                          onClick={() => toggleActive(u._id, !!u.isActive, `${u.prenom} ${u.nom}`)}
                          title={u.isActive ? "Désactiver" : "Activer"}
                        >
                          {u.isActive ? <Lock className="h-4 w-4" /> : "Activer"}
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
                        {(statusFilter !== "all" || roleFilter !== "all") && (
                          <button
                            className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                            onClick={() => {
                              setStatusFilter("all")
                              setRoleFilter("all")
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
                setShowAddModal(false)
                fetchEmployees()
                toast.success("Utilisateur créé avec succès")
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
                setShowEditModal(false)
                fetchEmployees()
                toast.success("Utilisateur modifié avec succès")
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
                    {selectedUser.prenom?.[0]}
                    {selectedUser.nom?.[0]}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800">
                    {selectedUser.prenom} {selectedUser.nom}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        selectedUser.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {selectedUser.isActive ? "Actif" : "Inactif"}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(selectedUser.role || "")}`}
                    >
                      {selectedUser.role || "Non défini"}
                    </span>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                      {selectedUser.matricule || "Sans matricule"}
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
                    <InfoItem
                      label="Date de naissance"
                      value={
                        selectedUser.date_naissance
                          ? new Date(selectedUser.date_naissance).toLocaleDateString("fr-FR")
                          : "-"
                      }
                    />
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
                    <InfoItem label="Département" value={selectedUser.departement?.nom || "Non défini"} />
                    <InfoItem label="Type de contrat" value={selectedUser.typeContrat} />
                    <InfoItem
                      label="Date d'embauche"
                      value={
                        selectedUser.date_embauche
                          ? new Date(selectedUser.date_embauche).toLocaleDateString("fr-FR")
                          : "-"
                      }
                    />
                    <InfoItem
                      label="Salaire"
                      value={selectedUser.salaire ? formatCurrency(Number(selectedUser.salaire)) : "-"}
                    />
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
                    <InfoItem label="Jours de congé restants" value={selectedUser.joursCongesRestants || "0"} />
                    <InfoItem
                      label="Ancienneté"
                      value={selectedUser.date_embauche ? calculateSeniority(selectedUser.date_embauche) : "-"}
                    />
                    <InfoItem
                      label="Dernière évaluation"
                      value={
                        selectedUser.derniereEvaluation
                          ? new Date(selectedUser.derniereEvaluation).toLocaleDateString("fr-FR")
                          : "Non évalué"
                      }
                    />
                    <InfoItem label="Notes" value={selectedUser.notes || "Aucune note"} isFullWidth />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedUser(selectedUser)
                    setShowEditModal(true)
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
  )
}
