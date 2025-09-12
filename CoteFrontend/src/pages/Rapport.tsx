/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from 'react';
import { Download, FileText, TrendingUp, Users, Calendar, DollarSign } from 'lucide-react';
import axios from 'axios';
const API_BASE = "http://localhost:8000/api";

interface Rapport {
  _id: string;
  type: string;
  periode: string;
  donnees: Record<string, any>;
  dateGeneration: string;
}

export const Reports: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [rapports, setRapports] = useState<Rapport[]>([]);

  // Charger les rapports
  useEffect(() => {
    axios.get(`${API_BASE}/rapports`)
      .then((res: { data: React.SetStateAction<Rapport[]>; }) => setRapports(res.data))
      .catch((error: any) => console.error("Erreur récupération rapports", error));
  }, []);

  // Créer un rapport exemple (salaire / présence / congé)
  const handleCreateRapport = async (type: string) => {
    try {
      const payload = {
        type,
        periode: "Septembre 2025",
        donnees: { exemple: "Valeurs dynamiques" },
      };
      const res = await axios.post(`${API_BASE}/rapports`, payload);
      setRapports([...rapports, res.data.rapport]);
    } catch (err) {
      console.error("Erreur création rapport", err);
    }
  };

  const reportTypes = [
    {
      title: 'Rapport des Effectifs',
      description: 'Evolution du nombre d\'employés par département',
      icon: Users,
      color: 'bg-blue-500',
      type: "Presence"
    },
    {
      title: 'Analyse des Absences',
      description: 'Taux d\'absentéisme et congés par période',
      icon: Calendar,
      color: 'bg-green-500',
      type: "Conge"
    },
    {
      title: 'Rapport Salarial',
      description: 'Masse salariale et évolution des coûts RH',
      icon: DollarSign,
      color: 'bg-yellow-500',
      type: "Salaire"
    },
    {
      title: 'Performance Globale',
      description: 'Indicateurs clés de performance RH',
      icon: TrendingUp,
      color: 'bg-purple-500',
      type: "Presence"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {reportTypes.map((report, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${report.color}`}>
                <report.icon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-800 mb-1">{report.title}</h3>
                <p className="text-xs text-gray-600 mb-2">{report.description}</p>
                <p className="text-xs text-blue-600">
                  {rapports.find(r => r.type === report.type)?.periode || "Aucun rapport"}
                </p>
              </div>
            </div>
            <button 
              onClick={() => handleCreateRapport(report.type)}
              className="w-full mt-4 flex items-center justify-center space-x-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg transition-colors"
            >
              <FileText className="h-4 w-4" />
              <span className="text-sm">Générer rapport</span>
            </button>
          </div>
        ))}
      </div>

      {/* Charts dynamiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {rapports.slice(-4).map((r) => (
          <div key={r._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">{r.type} – {r.periode}</h3>
            <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
              {JSON.stringify(r.donnees, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </div>
  );
};
