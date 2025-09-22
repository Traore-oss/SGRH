/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { type Performance } from "../Components/ServicePerformance";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

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

// Fonction pour obtenir la classe de couleur en fonction du statut
const getStatusColor = (status: Goal["realisation"]) => {
  switch (status) {
    case "Non démarré": return "bg-gray-100 text-gray-700 border border-gray-300";
    case "En cours": return "bg-blue-50 text-blue-700 border border-blue-200";
    case "Terminé": return "bg-green-50 text-green-700 border border-green-200";
    default: return "bg-gray-100 text-gray-700";
  }
};

// Fonction pour obtenir l'icône en fonction du statut
const getStatusIcon = (status: Goal["realisation"]) => {
  switch (status) {
    case "Non démarré": 
      return (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    case "En cours": 
      return (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"></path>
        </svg>
      );
    case "Terminé": 
      return (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
    default: 
      return (
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      );
  }
};

export const EmployeeGoals: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  useEffect(() => {
    if (!user?._id) return;

    const fetchGoals = async () => {
      setLoading(true);
      setError(null);

      try {
        const res = await axios.get<Performance[]>(`${API_BASE}/performances`, {
          withCredentials: true,
        });

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

        if (isMounted) {
          setGoals(data);
        }
      } catch (err: any) {
        console.error("Erreur récupération des performances :", err);
        if (isMounted) {
          setError("Impossible de récupérer les performances.");
          setGoals([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchGoals();
  }, [user, isMounted]);

  if (authLoading || loading) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="text-center animate-fade-in">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Chargement des objectifs...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-md w-full animate-fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-red-100 p-3 rounded-full">
            <svg className="h-8 w-8 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">Erreur</h3>
        <p className="text-gray-600 text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-6 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Réessayer
        </button>
      </div>
    </div>
  );

  if (!goals.length) return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center animate-fade-in">
        <div className="mb-6">
          <svg className="w-20 h-20 text-gray-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
        </div>
        <h3 className="text-2xl font-semibold text-gray-800 mb-3">Aucun objectif trouvé</h3>
        <p className="text-gray-600 mb-6">Vos objectifs apparaîtront ici une fois définis par votre manager.</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Actualiser
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes progressBar {
          0% { width: 0%; }
          100% { width: var(--progress-width); }
        }
        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-progress {
          animation: progressBar 1.5s ease-out forwards;
        }
        .animate-stagger > * {
          opacity: 0;
        }
        .animate-stagger > *:nth-child(1) { animation: fadeIn 0.6s 0.1s forwards; }
        .animate-stagger > *:nth-child(2) { animation: fadeIn 0.6s 0.2s forwards; }
        .animate-stagger > *:nth-child(3) { animation: fadeIn 0.6s 0.3s forwards; }
        .animate-stagger > *:nth-child(4) { animation: fadeIn 0.6s 0.4s forwards; }
        .animate-stagger > *:nth-child(5) { animation: fadeIn 0.6s 0.5s forwards; }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.15);
        }
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-3px) scale(1.02);
        }
      `}</style>

      <div className="max-w-7xl mx-auto">
        {/* En-tête avec animation */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Mes Objectifs Professionnels</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Suivez l'avancement de vos objectifs et mesurez vos performances
          </p>
        </div>
        
        {/* Statistiques résumé avec animations */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 animate-stagger">
          <div className="stat-card bg-white rounded-2xl shadow-lg p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-blue-600 mb-2">{goals.length}</div>
            <div className="text-sm font-medium text-gray-600">Objectifs total</div>
          </div>
          <div className="stat-card bg-white rounded-2xl shadow-lg p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {goals.filter(g => g.realisation === "Terminé").length}
            </div>
            <div className="text-sm font-medium text-gray-600">Terminés</div>
          </div>
          <div className="stat-card bg-white rounded-2xl shadow-lg p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-blue-500 mb-2">
              {goals.filter(g => g.realisation === "En cours").length}
            </div>
            <div className="text-sm font-medium text-gray-600">En cours</div>
          </div>
          <div className="stat-card bg-white rounded-2xl shadow-lg p-6 text-center hover-lift">
            <div className="text-3xl font-bold text-gray-600 mb-2">
              {goals.filter(g => g.realisation === "Non démarré").length}
            </div>
            <div className="text-sm font-medium text-gray-600">Non démarrés</div>
          </div>
        </div>

        {/* Version desktop - Tableau avec animations améliorées */}
        <div className="hidden lg:block bg-white rounded-2xl shadow-xl overflow-hidden mb-8 animate-scale-in">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-100">
            <h2 className="text-2xl font-semibold text-gray-800">Tableau des Objectifs</h2>
            <p className="text-gray-600 mt-2">{goals.length} objectif(s) au total</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Objectif
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Progression
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Évaluation
                  </th>
                  <th className="px-8 py-4 text-left text-sm font-medium text-gray-600 uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {goals.map((goal, index) => (
                  <tr 
                    key={goal._id} 
                    className="hover:bg-gray-50 transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <td className="px-8 py-6 whitespace-normal">
                      <div className="text-lg font-semibold text-gray-800 mb-1">{goal.objectif}</div>
                      <div className="text-sm text-gray-500">
                        {goal.employe.nom} {goal.employe.prenom}
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.realisation)} transition-colors duration-300`}>
                        {getStatusIcon(goal.realisation)}
                        {goal.realisation}
                      </span>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-progress"
                            style={{ 
                              width: `${realisationToPercent(goal.realisation)}%`,
                              '--progress-width': `${realisationToPercent(goal.realisation)}%`
                            } as React.CSSProperties}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {realisationToPercent(goal.realisation)}%
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-normal text-base text-gray-800">
                      {goal.evaluation}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm text-gray-600">
                      {new Date(goal.createdAt).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Version tablette avec animations */}
        <div className="hidden md:block lg:hidden">
          <div className="grid grid-cols-1 gap-6">
            {goals.map((goal, index) => (
              <div 
                key={goal._id} 
                className="bg-white rounded-xl shadow-lg p-6 hover-lift animate-scale-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-800">{goal.objectif}</h3>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(goal.realisation)}`}>
                    {getStatusIcon(goal.realisation)}
                    {goal.realisation}
                  </span>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center mb-2">
                    <div className="w-40 bg-gray-200 rounded-full h-3 mr-3 overflow-hidden">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-progress"
                        style={{ 
                          width: `${realisationToPercent(goal.realisation)}%`,
                          '--progress-width': `${realisationToPercent(goal.realisation)}%`
                        } as React.CSSProperties}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {realisationToPercent(goal.realisation)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-gray-700 mb-4">
                  <span className="font-semibold">Évaluation:</span> {goal.evaluation}
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div>Créé le: {new Date(goal.createdAt).toLocaleDateString('fr-FR')}</div>
                  <div>{goal.employe.nom} {goal.employe.prenom}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Version mobile avec animations */}
        <div className="md:hidden">
          <div className="grid grid-cols-1 gap-4">
            {goals.map((goal, index) => (
              <div 
                key={goal._id} 
                className="bg-white rounded-xl shadow-lg p-5 hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">{goal.objectif}</h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(goal.realisation)}`}>
                    {getStatusIcon(goal.realisation)}
                    {goal.realisation}
                  </span>
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center mb-1">
                    <div className="w-28 bg-gray-200 rounded-full h-2 mr-2 overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 animate-progress"
                        style={{ 
                          width: `${realisationToPercent(goal.realisation)}%`,
                          '--progress-width': `${realisationToPercent(goal.realisation)}%`
                        } as React.CSSProperties}
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700">
                      {realisationToPercent(goal.realisation)}%
                    </span>
                  </div>
                </div>
                
                <div className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Évaluation:</span> {goal.evaluation}
                </div>
                
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Créé le: {new Date(goal.createdAt).toLocaleDateString('fr-FR')}</div>
                  <div>{goal.employe.nom} {goal.employe.prenom}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pied de page avec animation */}
        <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: '0.6s' }}>
          <p className="text-gray-500 text-sm">
            {new Date().getFullYear()} • Gestion des Objectifs • {goals.length} objectif(s) chargé(s)
          </p>
        </div>
      </div>
    </div>
  );
};