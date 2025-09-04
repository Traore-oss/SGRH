import React from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  UserPlus
} from 'lucide-react';
import { StatsCard } from '../commons/StatsCard';
import { Chart } from '../commons/Chart';

export const Dashboard: React.FC = () => {
  const stats = [
    {
      title: 'Total Employés',
      value: '247',
      change: '+12%',
      trend: 'up' as const,
      icon: Users,
      color: 'blue' as const
    },
    {
      title: 'Demandes de Congé',
      value: '18',
      change: '+3 nouvelles',
      trend: 'neutral' as const,
      icon: Calendar,
      color: 'yellow' as const
    },
    {
      title: 'Taux de Présence',
      value: '94.2%',
      change: '+2.1%',
      trend: 'up' as const,
      icon: CheckCircle,
      color: 'green' as const
    },
    {
      title: 'Retards ce Mois',
      value: '23',
      change: '-5 vs mois dernier',
      trend: 'down' as const,
      icon: Clock,
      color: 'red' as const
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Activités Récentes</h3>
          <div className="space-y-4">
            {[
              { icon: UserPlus, text: 'Marie Dubois a été embauchée', time: 'Il y a 2h', color: 'text-green-600' },
              { icon: Calendar, text: 'Demande de congé de Pierre Martin', time: 'Il y a 4h', color: 'text-blue-600' },
              { icon: AlertCircle, text: 'Retard signalé - Julie Moreau', time: 'Il y a 6h', color: 'text-yellow-600' },
              { icon: CheckCircle, text: 'Formation complétée - équipe IT', time: 'Hier', color: 'text-green-600' },
              { icon: XCircle, text: 'Absence non justifiée - Paul Durand', time: 'Hier', color: 'text-red-600' }
            ].map((activity, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <activity.icon className={`h-5 w-5 ${activity.color}`} />
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{activity.text}</p>
                  <p className="text-xs text-gray-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions Rapides</h3>
          <div className="space-y-3">
            {[
              { label: 'Nouvel Employé', color: 'bg-blue-600' },
              { label: 'Générer Bulletin', color: 'bg-green-600' },
              { label: 'Valider Congés', color: 'bg-yellow-600' },
              { label: 'Nouveau Département', color: 'bg-purple-600' },
              { label: 'Rapport Mensuel', color: 'bg-gray-600' }
            ].map((action, index) => (
              <button
                key={index}
                className={`w-full text-left px-4 py-3 ${action.color} text-white rounded-lg hover:opacity-90 transition-opacity`}
              >
                {action.label}
              </button>
            ))}
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
    </div>
  );
};