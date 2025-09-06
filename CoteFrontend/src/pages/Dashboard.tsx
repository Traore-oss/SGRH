/* eslint-disable @typescript-eslint/no-unused-vars */
/* Dashboard.tsx */
import React, { useEffect, useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  CheckCircle,
  UserPlus
} from 'lucide-react';
import { StatsCard } from '../commons/StatsCard';
import { Chart } from '../commons/Chart';
import { toast } from 'react-toastify';

// ✅ Correct imports
import { getEmployees, type Employee } from '../Components/ServiceEmployer';
import { EmployeeForm } from '../forms/EmployeeForm';
// import { EmployeeForm } from './EmployeeForm';

export const Dashboard: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data);
    } catch (error) {
      toast.error("Erreur lors de la récupération des employés");
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };


  const handleFormSubmit = () => {
    setShowForm(false);
    fetchEmployees();
  };

  const stats = [
    { title: 'Total Employés', value: employees.length.toString(), change: '+12%', trend: 'up' as const, icon: Users, color: 'blue' as const },
    { title: 'Demandes de Congé', value: '18', change: '+3 nouvelles', trend: 'neutral' as const, icon: Calendar, color: 'yellow' as const },
    { title: 'Taux de Présence', value: '94.2%', change: '+2.1%', trend: 'up' as const, icon: CheckCircle, color: 'green' as const },
    { title: 'Retards ce Mois', value: '23', change: '-5 vs mois dernier', trend: 'down' as const, icon: Clock, color: 'red' as const }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <StatsCard key={index} {...stat} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activités Récentes</h3>
          <div className="space-y-4">
            {employees.slice(0, 5).map((emp, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <UserPlus className="h-5 w-5 text-green-600" />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{emp.nom} {emp.prenom} a été ajouté</p>
                  <p className="text-xs text-gray-500">Il y a quelques instants</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="space-y-3">
            <button
              onClick={handleAddEmployee}
              className="w-full text-left px-4 py-3 bg-blue-600 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Nouvel Employé
            </button>
            <button className="w-full text-left px-4 py-3 bg-green-600 text-white rounded-lg hover:opacity-90 transition-opacity">
              Générer Bulletin
            </button>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Évolution des Effectifs</h3>
          <Chart 
            type="line"
            data={[
              { month: 'Jan', value: 235 },
              { month: 'Fév', value: 238 },
              { month: 'Mar', value: 242 },
              { month: 'Avr', value: 245 },
              { month: 'Mai', value: 247 }
            ]}
            color="blue"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Répartition par Département</h3>
          <Chart 
            type="bar"
            data={[
              { name: 'IT', value: 45 },
              { name: 'RH', value: 12 },
              { name: 'Finance', value: 28 },
              { name: 'Marketing', value: 35 },
              { name: 'Ventes', value: 67 }
            ]}
            color="green"
          />
        </div>
      </div>

      {/* Employee Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">{selectedEmployee ? 'Modifier Employé' : 'Ajouter Employé'}</h2>
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
