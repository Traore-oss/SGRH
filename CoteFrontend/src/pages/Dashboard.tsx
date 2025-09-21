/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  UserPlus,
  MoreHorizontal,
  X,
  Plus,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { StatsCard } from '../commons/StatsCard';
import { Chart } from '../commons/Chart';
import { toast } from 'react-toastify';
import { getEmployees, type Employee } from '../Components/ServiceEmployer';
import { getDemandesConge, type Conge } from '../Components/CongesService';
import { EmployeeForm } from '../forms/EmployeeForm';

export const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [conges, setConges] = useState<Conge[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  // 🔹 Récupérer les employés
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getEmployees();
      setEmployees(data);
    } catch  {
      toast.error("Erreur lors de la récupération des employés");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Récupérer les congés
  const fetchConges = async () => {
    try {
      const data = await getDemandesConge();
      setConges(data);
    } catch{
      toast.error("Erreur lors de la récupération des congés");
    }
  };

  useEffect(() => {
    fetchEmployees();
    fetchConges();
  }, []);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleFormSubmit = () => {
    setShowForm(false);
    fetchEmployees();
    fetchConges();
    toast.success(selectedEmployee ? "Employé modifié avec succès" : "Employé ajouté avec succès");
  };

  // Filtrer les employés selon les critères de recherche
  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = 
      emp.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.prenom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = 
      filterDepartment === 'all' || 
      emp.departement?.nom?.toLowerCase() === filterDepartment.toLowerCase();
    
    return matchesSearch && matchesDepartment;
  });

  // Départements uniques
  const departments = [...new Set(employees.map(emp => emp.departement?.nom).filter(Boolean))];

  // Statistiques dynamiques
  const totalEmployees = employees.length;
  const presenceRate = employees.length > 0 
    ? ((employees.filter(emp => (emp as any).present).length / employees.length) * 100).toFixed(1)
    : '0.0';

  const totalConges = conges.length;
  const congesEnAttente = conges.filter(c => c.etat === 'en attente').length;

  // Données pour le mini-graph des congés
  const congesStatsData = [
    { name: 'En attente', value: conges.filter(c => c.etat === 'en attente').length },
    { name: 'Approuvé', value: conges.filter(c => c.etat === 'approuvé').length },
    { name: 'Refusé', value: conges.filter(c => c.etat === 'refusé').length },
  ];

  const stats = [
    { 
      title: 'Total Employés', 
      value: totalEmployees.toString(), 
      change: '+12%', 
      trend: 'up' as const, 
      icon: Users, 
      color: 'blue' as const,
      description: 'Depuis le mois dernier'
    },
    { 
      title: 'Demandes de Congé', 
      value: totalConges.toString(), 
      change: `+${congesEnAttente} nouvelles`, 
      trend: 'neutral' as const, 
      icon: Calendar, 
      color: 'yellow' as const,
      description: 'En attente de validation',
      miniChart: congesStatsData
    },
    { 
      title: 'Taux de Présence', 
      value: `${presenceRate}%`, 
      change: '+2.1%', 
      trend: 'up' as const, 
      icon: CheckCircle, 
      color: 'green' as const,
      description: 'Moyenne mensuelle'
    },
    { 
      title: 'Retards ce Mois', 
      value: '23', 
      change: '-5 vs mois dernier', 
      trend: 'down' as const, 
      icon: Clock, 
      color: 'red' as const,
      description: 'Amélioration constante'
    }
  ];

  // Graphiques principaux
  const workforceData = [
    { month: 'Jan', value: 235 },
    { month: 'Fév', value: 238 },
    { month: 'Mar', value: 242 },
    { month: 'Avr', value: 245 },
    { month: 'Mai', value: 247 },
    { month: 'Juin', value: 252 }
  ];

  const departmentData = employees.length > 0
    ? Object.entries(
        employees.reduce((acc, emp) => {
          const dept = emp.departement?.nom || 'Non assigné';
          acc[dept] = (acc[dept] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      ).map(([name, value]) => ({ name, value }))
    : [
        { name: 'IT', value: 45 },
        { name: 'RH', value: 12 },
        { name: 'Finance', value: 28 },
        { name: 'Marketing', value: 35 },
        { name: 'Ventes', value: 67 }
      ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="text-gray-600">Bienvenue dans votre espace de gestion des ressources humaines</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard 
            key={index} 
            {...stat} 
            loading={loading}
            miniChart={stat.miniChart} // Mini-graph intégré pour les congés
          />
        ))}
      </div>

      {/* Employees Recent & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">Employés Récents</h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les départements</option>
                {departments.map((dept, index) => (
                  <option key={index} value={dept || ''}>
                    {dept || 'Non assigné'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-100 animate-pulse">
                  <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  </div>
                </div>
              ))
            ) : filteredEmployees.length > 0 ? (
              filteredEmployees.slice(0, 5).map((emp, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group cursor-pointer"
                  onClick={() => handleEditEmployee(emp)}
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-800 font-medium">
                        {emp.prenom?.[0]}{emp.nom?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{emp.prenom} {emp.nom}</p>
                      <p className="text-xs text-gray-500">{emp.poste || 'Poste non spécifié'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {emp.departement && (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                        {emp.departement.nom}
                      </span>
                    )}
                    <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun employé trouvé
              </div>
            )}
            
            {filteredEmployees.length > 5 && (
              <div className="text-center pt-4">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  Voir tous les employés ({employees.length})
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="space-y-3">
            <button
              onClick={handleAddEmployee}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <span>Nouvel Employé</span>
              <UserPlus size={18} />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <span>Générer Bulletin</span>
              <Download size={18} />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              <span>Planifier Congés</span>
              <Calendar size={18} />
            </button>
            <button className="w-full flex items-center justify-between px-4 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
              <span>Exporter Données</span>
              <Download size={18} />
            </button>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Statistiques Rapides</h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Employés actifs</span>
                <span className="font-medium">{employees.filter(e => e.actif !== false).length}/{employees.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">En télétravail</span>
                <span className="font-medium">12</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Congés cette semaine</span>
                <span className="font-medium">{congesEnAttente}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Évolution des Effectifs</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <Filter size={18} />
            </button>
          </div>
          <Chart 
            type="line"
            data={workforceData}
            color="blue"
            height={250}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Répartition par Département</h3>
            <button className="text-gray-500 hover:text-gray-700">
              <Filter size={18} />
            </button>
          </div>
          <Chart 
            type="bar"
            data={departmentData}
            color="green"
            height={250}
          />
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedEmployee ? 'Modifier Employé' : 'Ajouter Employé'}
              </h2>
              <button 
                onClick={() => setShowForm(false)}
                className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            <EmployeeForm 
              user={selectedEmployee} 
              onSubmit={handleFormSubmit} 
              onClose={() => setShowForm(false)} 
            />
          </div>
        </div>
      )}
    </div>
  );
};
