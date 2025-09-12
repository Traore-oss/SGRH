/* eslint-disable react-refresh/only-export-components */
// /* eslint-disable react-refresh/only-export-components */
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
  employe: string | Employee; // Peut être l'ID ou l'objet Employee complet
  objectif: string;
  description: string;
  realisation: 'Non démarré' | 'En cours' | 'Terminé';
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Insuffisant';
  createdAt?: string;
  updatedAt?: string;
}

// Fonctions API pour les employés
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/`, {
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
    const response = await fetch(`${API_BASE}/api/performances/`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la récupération des performances');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la récupération des performances:', error);
    throw new Error(error instanceof Error ? error.message : 'Impossible de charger les performances');
  }
};

export const addPerformance = async (
  perf: Omit<Performance, '_id' | 'createdAt' | 'updatedAt'> & { rh: string }
): Promise<Performance> => {
  try {
    const performanceData = {
      ...perf,
      matricule: typeof perf.employe === 'object' ? perf.employe.matricule : perf.employe
    };

    const response = await fetch(`${API_BASE}/api/performances`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(performanceData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de l\'ajout de la performance');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la performance:', error);
    throw new Error(error instanceof Error ? error.message : 'Impossible d\'ajouter la performance');
  }
};


export const updatePerformance = async (id: string, perf: Omit<Performance, 'createdAt' | 'updatedAt'>): Promise<Performance> => {
  try {
    // Préparer les données pour le backend
    const performanceData = {
      ...perf,
      employe: typeof perf.employe === 'object' ? perf.employe._id : perf.employe
    };

    const response = await fetch(`${API_BASE}/api/performances/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(performanceData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la modification de la performance');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors de la modification de la performance:', error);
    throw new Error(error instanceof Error ? error.message : 'Impossible de modifier la performance');
  }
};

export const deletePerformance = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/performances/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Erreur lors de la suppression de la performance');
    }
  } catch (error) {
    console.error('Erreur lors de la suppression de la performance:', error);
    throw new Error(error instanceof Error ? error.message : 'Impossible de supprimer la performance');
  }
};

// Fonction utilitaire pour obtenir une valeur sécurisée
const getSafeValue = (value: any, defaultValue: string = '-') => {
  return value ?? defaultValue;
};

// Fonction utilitaire pour obtenir le nom complet d'un employé
const getEmployeeName = (employee: Employee | string | undefined, employees: Employee[]): string => {
  if (!employee) return '-';
  
  if (typeof employee === 'string') {
    const foundEmployee = employees.find(emp => emp._id === employee);
    return foundEmployee ? `${getSafeValue(foundEmployee.prenom)} ${getSafeValue(foundEmployee.nom)}` : '-';
  }
  
  return `${getSafeValue(employee.prenom)} ${getSafeValue(employee.nom)}`;
};

// Fonction utilitaire pour obtenir les détails d'un employé
const getEmployeeDetails = (employee: Employee | string | undefined, employees: Employee[]): Employee | null => {
  if (!employee) return null;
  
  if (typeof employee === 'string') {
    return employees.find(emp => emp._id === employee) || null;
  }
  
  return employee as Employee; // TypeScript considère `employee` comme `Employee` s'il n'est pas une string
};


export const PerformanceEmployer: React.FC = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
const [formData, setFormData] = useState<{
  employeId: string;
  matricule: string;
  objectif: string;
  description: string;
  realisation: Performance['realisation'];
  evaluation: Performance['evaluation'];
  rhId: string; // <-- ajouté ici
}>({
  employeId: '',
  matricule: '',
  objectif: '',
  description: '',
  realisation: 'Non démarré',
  evaluation: 'Moyen',
  rhId: '' // <-- valeur initiale
});
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setApiError(null);
        
        // Récupérer d'abord les employés
        const emps = await getEmployees();
        setEmployees(emps);
        
        // Ensuite récupérer les performances
        try {
          const perfs = await getPerformances();
          // Assurez-vous que l'employé dans la performance est un objet Employee et non juste un ID
          const populatedPerfs = perfs.map(perf => {
            if (typeof perf.employe === 'string') {
              const foundEmp = emps.find(e => e._id === perf.employe);
              return { ...perf, employe: foundEmp || perf.employe };
            }
            return perf;
          });
          setPerformances(populatedPerfs);
        } catch (perfError) {
          console.warn('Erreur lors du chargement des performances:', perfError);
          setApiError('Les performances n\'ont pas pu être chargées, mais vous pouvez toujours en ajouter de nouvelles.');
          setPerformances([]);
        }
      } catch (error) {
        console.error('Erreur chargement données:', error);
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        setApiError(`Erreur lors du chargement des données: ${errorMessage}`);
        toast.error('Erreur lors du chargement des données');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fonction pour rechercher l'employé par matricule
const searchEmployee = () => {
  try {
    // On récupère la valeur du matricule à rechercher, en la nettoyant
    const matriculeToSearch = formData.matricule?.trim().toLowerCase() || '';

    if (!matriculeToSearch) {
      toast.error("Veuillez entrer un matricule !");
      return;
    }

    // Recherche sécurisée dans la liste des employés
    const employee = employees.find(emp => 
      emp?.matricule && emp.matricule.toLowerCase() === matriculeToSearch
    );

    if (!employee) {
      toast.error("Employé non trouvé !");
      return;
    }

    // Si trouvé, on peut mettre à jour l'état ou afficher les détails
    setSelectedEmployee(employee);
    toast.success("Employé trouvé !");
  } catch (error) {
    console.error("Erreur lors de la recherche de l'employé :", error);
    toast.error("Une erreur est survenue lors de la recherche !");
  }
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
        const updatedPerformance: Omit<Performance, 'createdAt' | 'updatedAt'> = {
          _id: editingPerformance._id,
          employe: formData.employeId,
          objectif: formData.objectif,
          description: formData.description,
          realisation: formData.realisation,
          evaluation: formData.evaluation
        };
        
        const result = await updatePerformance(editingPerformance._id, updatedPerformance);
        setPerformances(prev => prev.map(perf => 
          perf._id === editingPerformance._id ? { ...result, employe: employeeInfo } : perf
        ));
        toast.success("Performance modifiée avec succès");
      } else {
        // Ajout
   const newPerformance: Omit<Performance, '_id' | 'createdAt' | 'updatedAt'> & { rh: string } = {
  employe: formData.employeId,
  objectif: formData.objectif,
  description: formData.description,
  realisation: formData.realisation,
  evaluation: formData.evaluation,
  rh: formData.rhId || ''
};

        const result = await addPerformance(newPerformance);
        setPerformances(prev => [...prev, { ...result, employe: employeeInfo as Employee }]); // Assurez-vous d'avoir l'objet employé complet ici
        toast.success("Performance ajoutée avec succès");
      }

      setShowModal(false);
      setEditingPerformance(null);
setFormData({ 
  employeId: '', 
  matricule: '', 
  objectif: '', 
  description: '', 
  realisation: 'Non démarré', 
  evaluation: 'Moyen', 
  rhId: '' // <-- ajouté
});
      setEmployeeInfo(null);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast.error(`Erreur lors de la sauvegarde: ${errorMessage}`);
    }
  };

  const handleDelete = async (id: string, performance: Performance) => {
    // Notification de confirmation élégante
    toast.info(
      <div className="p-4">
        <div className="text-lg font-semibold mb-2">Confirmer la suppression</div>
        <p className="mb-4">Êtes-vous sûr de vouloir supprimer la performance de {getEmployeeName(performance.employe, employees)} ?</p>
        <div className="flex space-x-2 justify-end">
          <button
            onClick={async () => {
              try {
                await deletePerformance(id);
                setPerformances(prev => prev.filter(p => p._id !== id));
                toast.success("Performance supprimée avec succès");
                toast.dismiss();
              } catch (error) {
                console.error('Erreur lors de la suppression:', error);
                const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
                toast.error(`Erreur lors de la suppression: ${errorMessage}`);
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
    
    // Récupérer l'employé associé à cette performance
    const employee = getEmployeeDetails(performance.employe, employees);
    
setFormData({ 
  employeId: '', 
  matricule: '', 
  objectif: '', 
  description: '', 
  realisation: 'Non démarré', 
  evaluation: 'Moyen', 
  rhId: '' // <-- ajouté
});    
    setEmployeeInfo(employee);
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
      case 'Insuffisant': return 'bg-red-100 text-red-800'; // Correction de 'Mauvais' à 'Insuffisant'
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
          setFormData({ 
            employeId: '', 
            matricule: '', 
            objectif: '', 
            description: '', 
            realisation: 'Non démarré', 
            evaluation: 'Moyen', 
            rhId: '' // <-- ajouté
          });
              setEmployeeInfo(null);
              setShowModal(true);
            }}
          >
            <Plus className="h-4 w-4" />
            <span>Ajouter une performance</span>
          </button>
        </div>

        {apiError && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Avertissement</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{apiError}</p>
                </div>
              </div>
            </div>
          </div>
        )}

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
                {performances.map(perf => {
                  const employee = getEmployeeDetails(perf.employe, employees);
                  return (
                    <tr key={perf._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
                            <User className="h-6 w-6 text-white" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getEmployeeName(perf.employe, employees)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {employee?.matricule || '-'} • {employee?.poste || '-'}
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
                  );
                })}
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
                    disabled={!!editingPerformance} // Désactiver la recherche si en mode édition
                  />
                  <button
                    type="button"
                    onClick={searchEmployee}
                    disabled={isSearching || !!editingPerformance} // Désactiver la recherche si en mode édition
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
                <label htmlFor="objectif" className="block text-sm font-medium text-gray-700 mb-1">Objectif *</label>
                <input
                  type="text"
                  id="objectif"
                  value={formData.objectif}
                  onChange={e => setFormData({ ...formData, objectif: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Définir l'objectif de l'employé"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Détails de l'objectif et des attentes"
                ></textarea>
              </div>

              <div>
                <label htmlFor="realisation" className="block text-sm font-medium text-gray-700 mb-1">Réalisation</label>
                <select
                  id="realisation"
                  value={formData.realisation}
                  onChange={e => setFormData({ ...formData, realisation: e.target.value as Performance['realisation'] })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Non démarré">Non démarré</option>
                  <option value="En cours">En cours</option>
                  <option value="Terminé">Terminé</option>
                </select>
              </div>

              <div>
                <label htmlFor="evaluation" className="block text-sm font-medium text-gray-700 mb-1">Évaluation</label>
                <select
                  id="evaluation"
                  value={formData.evaluation}
                  onChange={e => setFormData({ ...formData, evaluation: e.target.value as Performance['evaluation'] })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Bon">Bon</option>
                  <option value="Moyen">Moyen</option>
                  <option value="Insuffisant">Insuffisant</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingPerformance ? "Modifier" : "Ajouter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de visualisation */}
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
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0 h-12 w-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold text-xl text-gray-900">
                    {getEmployeeName(selectedPerformance.employe, employees)}
                  </h4>
                  {getEmployeeDetails(selectedPerformance.employe, employees) && (
                    <p className="text-sm text-gray-600">
                      {getSafeValue(getEmployeeDetails(selectedPerformance.employe, employees)?.matricule)} • {getSafeValue(getEmployeeDetails(selectedPerformance.employe, employees)?.poste)}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700">Objectif:</p>
                <p className="text-gray-900 mt-1">{getSafeValue(selectedPerformance.objectif)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Description:</p>
                <p className="text-gray-900 mt-1">{getSafeValue(selectedPerformance.description)}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Réalisation:</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full mt-1 inline-block ${getStatusBadgeClass(getSafeValue(selectedPerformance.realisation, 'Non démarré'))}`}>
                  {getSafeValue(selectedPerformance.realisation, 'Non démarré')}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Évaluation:</p>
                <span className={`px-3 py-1 text-sm font-medium rounded-full mt-1 inline-block ${getEvaluationBadgeClass(getSafeValue(selectedPerformance.evaluation, 'Moyen'))}`}>
                  {getSafeValue(selectedPerformance.evaluation, 'Moyen')}
                </span>
              </div>
              {selectedPerformance.createdAt && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Date de création:</p>
                  <p className="text-gray-900 mt-1">{new Date(selectedPerformance.createdAt).toLocaleDateString()}</p>
                </div>
              )}
              {selectedPerformance.updatedAt && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Dernière modification:</p>
                  <p className="text-gray-900 mt-1">{new Date(selectedPerformance.updatedAt).toLocaleDateString()}</p>
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
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

function setSelectedEmployee(employee: Employee) {
  throw new Error('Function not implemented.');
}
