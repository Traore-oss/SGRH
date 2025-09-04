import React, { useState } from 'react';
import { Download, FileText, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import { Chart } from '../commons/Chart';

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');

  const reportTypes = [
    {
      title: 'Rapport des Effectifs',
      description: 'Evolution du nombre d\'employés par département',
      icon: Users,
      color: 'bg-blue-500',
      data: 'Dernière mise à jour: Aujourd\'hui'
    },
    {
      title: 'Analyse des Absences',
      description: 'Taux d\'absentéisme et congés par période',
      icon: Calendar,
      color: 'bg-green-500',
      data: 'Taux moyen: 4.2%'
    },
    {
      title: 'Rapport Salarial',
      description: 'Masse salariale et évolution des coûts RH',
      icon: DollarSign,
      color: 'bg-yellow-500',
      data: 'Budget mensuel: 1.2M€'
    },
    {
      title: 'Performance Globale',
      description: 'Indicateurs clés de performance RH',
      icon: TrendingUp,
      color: 'bg-purple-500',
      data: 'Score global: 87%'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header with Period Selection */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Rapports et Statistiques</h2>
          <p className="text-gray-600">Analysez les données RH de votre entreprise</p>
        </div>
        <div className="flex items-center space-x-3">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="weekly">Cette semaine</option>
            <option value="monthly">Ce mois</option>
            <option value="quarterly">Ce trimestre</option>
            <option value="yearly">Cette année</option>
          </select>
          <button className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            <Download className="h-4 w-4" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${report.color}`}>
                <report.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{report.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                <p className="text-xs text-blue-600">{report.data}</p>
              </div>
            </div>
            <button className="w-full mt-4 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Générer rapport</span>
            </button>
          </div>
        ))}
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
              { month: 'Mai', value: 247 },
              { month: 'Juin', value: 250 }
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
              { name: 'Ventes', value: 67 },
              { name: 'Support', value: 23 }
            ]}
            color="green"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Taux d'Absentéisme (%)</h3>
          <Chart 
            type="line"
            data={[
              { month: 'Jan', value: 3.2 },
              { month: 'Fév', value: 4.1 },
              { month: 'Mar', value: 2.8 },
              { month: 'Avr', value: 3.5 },
              { month: 'Mai', value: 4.2 },
              { month: 'Juin', value: 3.9 }
            ]}
            color="red"
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Masse Salariale (K€)</h3>
          <Chart 
            type="bar"
            data={[
              { name: 'Jan', value: 1150 },
              { name: 'Fév', value: 1180 },
              { name: 'Mar', value: 1220 },
              { name: 'Avr', value: 1200 },
              { name: 'Mai', value: 1250 },
              { name: 'Juin', value: 1280 }
            ]}
            color="purple"
          />
        </div>
      </div>

      {/* Key Metrics Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Indicateurs Clés</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { label: 'Turnover', value: '8.5%', trend: 'down', color: 'green' },
            { label: 'Satisfaction', value: '87%', trend: 'up', color: 'green' },
            { label: 'Formation/An', value: '24h', trend: 'up', color: 'blue' },
            { label: 'Coût/Employé', value: '4.2K€', trend: 'stable', color: 'gray' },
            { label: 'Productivité', value: '92%', trend: 'up', color: 'green' },
            { label: 'Absentéisme', value: '4.1%', trend: 'down', color: 'green' }
          ].map((metric, index) => (
            <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-gray-800">{metric.value}</p>
              <p className="text-sm text-gray-600">{metric.label}</p>
              <div className={`inline-flex items-center mt-1 text-xs ${
                metric.color === 'green' ? 'text-green-600' : 
                metric.color === 'red' ? 'text-red-600' : 
                metric.color === 'blue' ? 'text-blue-600' : 'text-gray-600'
              }`}>
                <TrendingUp className="h-3 w-3 mr-1" />
                {metric.trend}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};