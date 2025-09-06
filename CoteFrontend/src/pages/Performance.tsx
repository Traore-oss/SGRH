/* eslint-disable react-refresh/only-export-components */
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit3, Trash2, Plus, Eye, X, User, FileText, Search } from 'lucide-react';
import { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// Configuration de l'URL de base pour l'API
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Interfaces
export interface Departement {
  _id: string;
  nom: string;
  code_departement: string;
}

export interface Employee {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  genre: string;
  date_naissance: string;
  poste: string;
  departement?: Departement;
  salaire: number;
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  role: string;
  statut: 'Actif' | 'Inactif' | 'Suspendu';
  isActive: boolean;
  date_embauche: string;
  photo?: string;
}

export interface Performance {
  _id?: string;
  employe: Employee;
  objectif: string;
  description: string;
  realisation: string;
  evaluation: string;
}

// Fonctions API pour les employés
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/getAllEmployees`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des employés');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

// Fonctions API pour les performances
export const getPerformances = async (): Promise<Performance[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/performances`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des performances');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des performances:', error);
    throw new Error('Impossible de charger les performances');
  }
};

export const addPerformance = async (perf: Omit<Performance, '_id'>): Promise<Performance> => {
  try {
    const response = await fetch(`${API_BASE}/api/performances`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(perf),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'ajout de la performance');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la performance:', error);
    throw new Error('Impossible d\'ajouter la performance');
  }
};

export const updatePerformance = async (id: string, perf: Performance): Promise<Performance> => {
  try {
    const response = await fetch(`${API_BASE}/api/performances/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(perf),
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la modification de la performance');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la modification de la performance:', error);
    throw new Error('Impossible de modifier la performance');
  }
};

export const deletePerformance = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/performances/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la suppression de la performance');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la performance:', error);
    throw new Error('Impossible de supprimer la performance');
  }
};

// Fonction utilitaire pour obtenir une valeur sécurisée
const getSafeValue = (value: any, defaultValue: string = '-') => {
  return value ?? defaultValue;
};

export const PerformanceEmployer: React.FC = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [formData, setFormData] = useState({
    matricule: '',
    objectif: '',
    description: '',
    realisation: 'Non démarré',
    evaluation: 'Moyen'
  });
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const emps = await getEmployees();
        setEmployees(emps);
        
        // Essayer de récupérer les performances depuis l'API
        try {
          const perfs = await getPerformances();
          setPerformances(perfs);
        } catch (apiError) {
          console.warn('Utilisation des données de démonstration suite à une erreur API');
          // Données de démonstration en cas d'erreur API
          const mockData: Performance[] = [
            {
              _id: '1',
              employe: emps[0] || { 
                _id: '1', 
                matricule: 'EMP001', 
                nom: 'Dupont', 
                prenom: 'Jean', 
                poste: 'Développeur', 
                departement: { _id: '1', nom: 'IT', code_departement: 'IT' },
                email: 'jean.dupont@example.com',
                telephone: '0123456789',
                adresse: '123 Rue Example',
                genre: 'Homme',
                date_naissance: '1990-01-01',
                salaire: 40000,
                typeContrat: 'CDI',
                role: 'Employé',
                statut: 'Actif',
                isActive: true,
                date_embauche: '2020-01-01'
              },
              objectif: 'Terminer le projet X',
              description: 'Développer les fonctionnalités principales',
              realisation: 'Terminé',
              evaluation: 'Excellent'
            },
            {
              _id: '2', 
              employe: emps[1] || { 
                _id: '2',
                matricule: 'EMP002', 
                nom: 'Martin', 
                prenom: 'Sophie', 
                poste: 'Designer', 
                departement: { _id: '2', nom: 'Design', code_departement: 'DES' },
                email: 'sophie.martin@example.com',
                telephone: '0987654321',
                adresse: '456 Rue Example',
                genre: 'Femme',
                date_naissance: '1992-05-15',
                salaire: 38000,
                typeContrat: 'CDI',
                role: 'Employé',
                statut: 'Actif',
                isActive: true,
                date_embauche: '2021-03-15'
              },
              objectif: 'Concevoir interface utilisateur',
              description: 'Créer une interface moderne et responsive',
              realisation: 'En cours',
              evaluation: 'Bon'
            }
          ];
          setPerformances(mockData);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonction pour rechercher l'employé par matricule
  const searchEmployee = () => {
    if (!formData.matricule.trim()) {
      toast.error("Veuillez saisir un matricule");
      return;
    }

    setIsSearching(true);
    
    // Simulation d'un délai de recherche
    setTimeout(() => {
      const employee = employees.find(emp => 
        emp.matricule.toLowerCase() === formData.matricule.toLowerCase().trim()
      );
      
      if (employee) {
        setEmployeeInfo(employee);
        toast.success("Employé trouvé avec succès");
      } else {
        setEmployeeInfo(null);
        toast.error("Aucun employé trouvé avec ce matricule");
      }
      setIsSearching(false);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!employeeInfo) {
      toast.error("Veuillez d'abord rechercher et sélectionner un employé");
      return;
    }

    if (!formData.objectif) {
      toast.error("L'objectif est obligatoire");
      return;
    }

    try {
      if (editingPerformance && editingPerformance._id) {
        // Modification
        const updatedPerformance: Performance = {
          _id: editingPerformance._id,
          employe: employeeInfo,
          objectif: formData.objectif,
          description: formData.description,
          realisation: formData.realisation,
          evaluation: formData.evaluation
        };
        
        // Essayer d'abord l'API, sinon mise à jour locale
        try {
          const result = await updatePerformance(editingPerformance._id, updatedPerformance);
          setPerformances(prev => prev.map(perf => 
            perf._id === editingPerformance._id ? result : perf
          ));
          toast.success("Performance modifiée avec succès");
        } catch (apiError) {
          // Fallback: mise à jour locale si l'API échoue
          setPerformances(prev => prev.map(perf =>
            perf._id === editingPerformance._id ? updatedPerformance : perf
          ));
          toast.success("Performance modifiée localement (mode démo)");
        }
      } else {
        // Ajout
        const newPerformance: Omit<Performance, '_id'> = {
          employe: employeeInfo,
          objectif: formData.objectif,
          description: formData.description,
          realisation: formData.realisation,
          evaluation: formData.evaluation
        };
        
        // Essayer d'abord l'API, sinon ajout local
        try {
          const result = await addPerformance(newPerformance);
          setPerformances(prev => [...prev, result]);
          toast.success("Performance ajoutée avec succès");
        } catch (apiError) {
          // Fallback: ajout local si l'API échoue
          const performanceWithId = {
            ...newPerformance,
            _id: Date.now().toString()
          } as Performance;
          
          setPerformances(prev => [...prev, performanceWithId]);
          toast.success("Performance ajoutée localement (mode démo)");
        }
      }

      setShowModal(false);
      setEditingPerformance(null);
      setFormData({ matricule: '', objectif: '', description: '', realisation: 'Non démarré', evaluation: 'Moyen' });
      setEmployeeInfo(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error("Erreur lors de la sauvegarde de la performance");
    }
  };

  const handleDelete = async (id: string, performance: Performance) => {
    // Notification de confirmation élégante
    toast.info(
      <div className="p-4">
        <div className="text-lg font-semibold mb-2">Confirmer la suppression</div>
        <p className="mb-4">Êtes-vous sûr de vouloir supprimer la performance de {getSafeValue(performance.employe.prenom)} {getSafeValue(performance.employe.nom)} ?</p>
        <div className="flex space-x-2 justify-end">
          <button
            onClick={async () => {
              try {
                // Essayer d'abord l'API, sinon suppression locale
                try {
                  await deletePerformance(id);
                  toast.success("Performance supprimée avec succès");
                } catch (apiError) {
                  // Fallback: suppression locale si l'API échoue
                  toast.success("Performance supprimée localement (mode démo)");
                }
                setPerformances(prev => prev.filter(p => p._id !== id));
                toast.dismiss();
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                toast.error("Erreur lors de la suppression");
                toast.dismiss();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Confirmer
          </button>
          <button
            onClick={() => toast.dismiss()}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Annuler
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false
      }
    );
  };

  const handleView = (performance: Performance) => {
    setSelectedPerformance(performance);
    setShowViewModal(true);
  };

  const handleEdit = (performance: Performance) => {
    setEditingPerformance(performance);
    setFormData({
      matricule: getSafeValue(performance.employe.matricule, ''),
      objectif: getSafeValue(performance.objectif, ''),
      description: getSafeValue(performance.description, ''),
      realisation: getSafeValue(performance.realisation, 'Non démarré'),
      evaluation: getSafeValue(performance.evaluation, 'Moyen')
    });
    setEmployeeInfo(performance.employe);
    setShowModal(true);
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'Terminé': return 'bg-green-100 text-green-800';
      case 'En cours': return 'bg-yellow-100 text-yellow-800';
      case 'Non démarré': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEvaluationBadgeClass = (evaluation: string) => {
    switch (evaluation) {
      case 'Excellent': return 'bg-purple-100 text-purple-800';
      case 'Bon': return 'bg-blue-100 text-blue-800';
      case 'Moyen': return 'bg-yellow-100 text-yellow-800';
      case 'Mauvais': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <header className="bg-blue-600 text-white py-5 shadow-md">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Gestion des Performances des Employés</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Liste des Performances</h2>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            onClick={() => {
              setEditingPerformance(null);
              setFormData({ matricule: '', objectif: '', description: '', realisation: 'Non démarré', evaluation: 'Moyen' });
              setEmployeeInfo(null);
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une performance</span>
          </button>
        </div>

        {/* Tableau performances */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectif</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Réalisation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Évaluation</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performances.map(perf => (
                  <tr key={perf._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {getSafeValue(perf.employe?.prenom)} {getSafeValue(perf.employe?.nom)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {getSafeValue(perf.employe?.matricule)} • {getSafeValue(perf.employe?.poste)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {getSafeValue(perf.objectif)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {getSafeValue(perf.description)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(getSafeValue(perf.realisation, 'Non démarré'))}`}>
                        {getSafeValue(perf.realisation, 'Non démarré')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEvaluationBadgeClass(getSafeValue(perf.evaluation, 'Moyen'))}`}>
                        {getSafeValue(perf.evaluation, 'Moyen')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(perf)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Voir détails"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(perf)}
                          className="p-2 text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(perf._id as string, perf)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {performances.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      <div className="flex flex-col items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-300 mb-2" />
                        <p>Aucune performance disponible</p>
                        <p className="text-sm">Commencez par ajouter une nouvelle performance</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Ajout / Edition */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-6">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingPerformance ? "Modifier la Performance" : "Ajouter une Performance"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Matricule *</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={formData.matricule}
                    onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                    className="flex-1 border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: EMP12345"
                    disabled={!!editingPerformance}
                  />
                  <button
                    type="button"
                    onClick={searchEmployee}
                    disabled={isSearching || !!editingPerformance}
                    className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center"
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {employeeInfo && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {getSafeValue(employeeInfo.prenom)} {getSafeValue(employeeInfo.nom)}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {getSafeValue(employeeInfo.poste)} • {getSafeValue(employeeInfo.departement?.nom)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectif *</label>
                <input
                  type="text"
                  value={formData.objectif}
                  onChange={e => setFormData({ ...formData, objectif: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réalisation</label>
                  <select
                    value={formData.realisation}
                    onChange={e => setFormData({ ...formData, realisation: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Non démarré">Non démarré</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Évaluation</label>
                  <select
                    value={formData.evaluation}
                    onChange={e => setFormData({ ...formData, evaluation: e.target.value })}
                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Mauvais">Mauvais</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Bon">Bon</option>
                    <option value="Excellent">Excellent</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={!employeeInfo}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  {editingPerformance ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Vue */}
      {showViewModal && selectedPerformance && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center border-b p-6">
              <h3 className="text-lg font-semibold text-gray-800">Détails de la Performance</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {getSafeValue(selectedPerformance.employe.prenom)} {getSafeValue(selectedPerformance.employe.nom)}
                  </h4>
                  <p className="text-sm text-gray-500">{getSafeValue(selectedPerformance.employe.matricule)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                  <p className="text-sm text-gray-900">{getSafeValue(selectedPerformance.employe.poste)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <p className="text-sm text-gray-900">{getSafeValue(selectedPerformance.employe.departement?.nom)}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectif</label>
                <p className="text-sm text-gray-900">{getSafeValue(selectedPerformance.objectif)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{getSafeValue(selectedPerformance.description)}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réalisation</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(getSafeValue(selectedPerformance.realisation, 'Non démarré'))}`}>
                    {getSafeValue(selectedPerformance.realisation, 'Non démarré')}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Évaluation</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEvaluationBadgeClass(getSafeValue(selectedPerformance.evaluation, 'Moyen'))}`}>
                    {getSafeValue(selectedPerformance.evaluation, 'Moyen')}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceEmployer;