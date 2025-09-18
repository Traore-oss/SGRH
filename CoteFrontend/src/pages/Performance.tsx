// /* eslint-disable @typescript-eslint/no-explicit-any */
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
import { Edit3, Trash2, Plus, Eye, X } from 'lucide-react';
import { useEffect, useState } from 'react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ===== Interfaces =====
export interface Departement {
  _id: string;
  nom: string;
  code_departement: string;
}

export interface Employee {
  employer: any;
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
  employe: string | Employee;
  objectif: string;
  description: string;
  realisation: 'Non démarré' | 'En cours' | 'Terminé';
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Insuffisant';
  createdAt?: string;
  updatedAt?: string;
}

// ===== API Functions =====
export const getEmployees = async (): Promise<Employee[]> => {
  const response = await fetch(`${API_BASE}/api/Users/`, { credentials: 'include' });
  if (!response.ok) throw new Error('Erreur lors de la récupération des employés');
  return response.json();
};

export const getPerformances = async (): Promise<Performance[]> => {
  const response = await fetch(`${API_BASE}/api/performances/`, { credentials: 'include' });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la récupération des performances');
  }
  return response.json();
};

// ===== API Function =====
export const addPerformance = async (perf: {
  matricule: string;
  objectif: string;
  description: string;
  realisation: Performance['realisation'];
  evaluation: Performance['evaluation'];
}) => {
  if (!perf.matricule) throw new Error("Le matricule est requis");

  const response = await fetch(`${API_BASE}/api/performances`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(perf),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Erreur lors de l'ajout de la performance");
  }

  return response.json();
};


export const updatePerformance = async (
  id: string,
  perf: Omit<Performance, 'createdAt' | 'updatedAt'>
): Promise<Performance> => {
  const performanceData = {
    ...perf,
    employe: typeof perf.employe === 'object' ? perf.employe._id : perf.employe
  };

  const response = await fetch(`${API_BASE}/api/performances/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(performanceData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la modification de la performance');
  }

  return response.json();
};


export const deletePerformance = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/api/performances/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la suppression de la performance');
  }
};

// ===== Utilitaires =====
const getSafeValue = (value: any, defaultValue: string = '-') => value ?? defaultValue;

const getEmployeeName = (employee: Employee | string | undefined, employees: Employee[]): string => {
  if (!employee) return '-';
  if (typeof employee === 'string') {
    const foundEmployee = employees.find(emp => emp._id === employee);
    return foundEmployee ? `${getSafeValue(foundEmployee.prenom)} ${getSafeValue(foundEmployee.nom)}` : '-';
  }
  return `${getSafeValue(employee.prenom)} ${getSafeValue(employee.nom)}`;
};

const getEmployeeDetails = (employee: Employee | string | undefined, employees: Employee[]): Employee | null => {
  if (!employee) return null;
  if (typeof employee === 'string') return employees.find(emp => emp._id === employee) || null;
  return employee as Employee;
};

// ✅ Fonction pour récupérer le matricule
const getMatricule = (perf: Performance, employees: Employee[]): string => {
  if (!perf.employe) return '-';
  if (typeof perf.employe === 'object') return perf.employe.matricule || '-';
  const emp = employees.find(e => e._id === perf.employe);
  return emp ? emp.matricule : '-';
};

// ===== Composant principal =====
export const PerformanceEmployer: React.FC = () => {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPerformance, setSelectedPerformance] = useState<Performance | null>(null);
  const [editingPerformance, setEditingPerformance] = useState<Performance | null>(null);
  const [employeeInfo, setEmployeeInfo] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    employeId: '',
    matricule: '',
    objectif: '',
    description: '',
    realisation: 'Non démarré' as Performance['realisation'],
    evaluation: 'Moyen' as Performance['evaluation'],
    rhId: ''
  });

  // ===== Fetch data =====
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const emps = await getEmployees();
        setEmployees(emps);
        const perfs = await getPerformances();
        const populatedPerfs = perfs.map(perf => ({
          ...perf,
          employe: typeof perf.employe === 'string' ? emps.find(e => e._id === perf.employe) || perf.employe : perf.employe
        }));
        setPerformances(populatedPerfs);
      } catch (error) {
        console.error('Erreur chargement données:', error);
        setApiError('Impossible de charger les données');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // ===== Recherche employé =====
const searchEmployee = () => {
  try {
    // Nettoyer le matricule entré
    const matriculeToSearch = formData.matricule?.trim().toLowerCase();
    if (!matriculeToSearch) return toast.error("Veuillez entrer un matricule !");

    // Vérifier que la liste des employés est chargée
    if (!employees || employees.length === 0) {
      return toast.error("La liste des employés est vide ou non chargée !");
    }

    // Chercher l'employé
    const employee = employees.find(emp => 
      emp.employer?.matricule?.trim().toLowerCase() === matriculeToSearch
    );

    if (!employee) {
      setEmployeeInfo(null);
      return toast.error("Employé non trouvé !");
    }

    // Mettre à jour l'état avec l'employé trouvé
    setEmployeeInfo(employee);
    setFormData(prev => ({ ...prev, employeId: employee._id }));
    toast.success(`Employé ${employee.nom} ${employee.prenom} trouvé !`);
  } catch (error) {
    console.error("Erreur recherche employé :", error);
    toast.error("Une erreur est survenue lors de la recherche !");
  }
};

  // ===== Submit =====
// ===== Handle Submit =====
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!employeeInfo) return toast.error("Veuillez rechercher un employé");

  // 🔹 Récupérer le matricule correct
  const matriculeToSend = employeeInfo?.employer?.matricule || employeeInfo?.matricule;
  if (!matriculeToSend) return toast.error("Le matricule de l'employé est introuvable !");

  if (editingPerformance && editingPerformance._id) {
    // Édition
    const updatedPerf: Omit<Performance, 'createdAt' | 'updatedAt'> = {
      _id: editingPerformance._id,
      employe: formData.employeId,
      objectif: formData.objectif,
      description: formData.description,
      realisation: formData.realisation,
      evaluation: formData.evaluation,
    };
    try {
      const result = await updatePerformance(editingPerformance._id, updatedPerf);
      setPerformances(prev => prev.map(p => p._id === editingPerformance._id ? { ...result, employe: employeeInfo } : p));
      toast.success("Performance modifiée avec succès");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de la modification");
    }
  } else {
    // Création
    const newPerf = {
      matricule: matriculeToSend,
      objectif: formData.objectif,
      description: formData.description,
      realisation: formData.realisation,
      evaluation: formData.evaluation,
    };
    try {
      const result = await addPerformance(newPerf);
      setPerformances(prev => [...prev, { ...result, employe: employeeInfo }]);
      toast.success("Performance ajoutée avec succès");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Erreur lors de l'ajout");
    }
  }

  // Reset du formulaire
  setShowModal(false);
  setEditingPerformance(null);
  setFormData({
    employeId: '',
    matricule: '',
    objectif: '',
    description: '',
    realisation: 'Non démarré',
    evaluation: 'Moyen',
    rhId: ''
  });
  setEmployeeInfo(null);
};

  // ===== Supprimer =====
  const handleDelete = async (id: string, perf: Performance) => {
    toast.info(
      <div className="p-4">
        <div className="text-lg font-semibold mb-2">Confirmer la suppression</div>
        <p className="mb-4">Supprimer la performance de {getEmployeeName(perf.employe, employees)} ?</p>
        <div className="flex space-x-2 justify-end">
          <button onClick={async () => {
            try { await deletePerformance(id); setPerformances(prev => prev.filter(p => p._id !== id)); toast.dismiss(); toast.success("Supprimée"); }
            catch { toast.dismiss(); toast.error("Erreur suppression"); }
          }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Confirmer</button>
          <button onClick={() => toast.dismiss()} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">Annuler</button>
        </div>
      </div>, { autoClose: false, closeButton: false }
    );
  };

  // ===== Éditer =====
  const handleEdit = (performance: Performance) => {
    setEditingPerformance(performance);
    const employee = getEmployeeDetails(performance.employe, employees);
    setEmployeeInfo(employee);

    setFormData({
      employeId: employee?._id || '',
      matricule: employee?.matricule || '',
      objectif: performance.objectif || '',
      description: performance.description || '',
      realisation: performance.realisation || 'Non démarré',
      evaluation: performance.evaluation || 'Moyen',
      rhId: ''
    });
    setShowModal(true);
  };

  // ===== Voir détails =====
  const handleView = (performance: Performance) => {
    setSelectedPerformance(performance);
    setShowViewModal(true);
  };

  // ===== Badges =====
  const getStatusBadgeClass = (status: string) => {
    switch(status){ 
      case 'Terminé': return 'bg-green-100 text-green-800'; 
      case 'En cours': return 'bg-yellow-100 text-yellow-800'; 
      case 'Non démarré': return 'bg-gray-100 text-gray-800'; 
      default: return 'bg-gray-100 text-gray-800'; 
    }
  };
  const getEvaluationBadgeClass = (evals: string) => {
    switch(evals){ 
      case 'Excellent': return 'bg-purple-100 text-purple-800'; 
      case 'Bon': return 'bg-blue-100 text-blue-800'; 
      case 'Moyen': return 'bg-yellow-100 text-yellow-800'; 
      case 'Insuffisant': return 'bg-red-100 text-red-800'; 
      default: return 'bg-gray-100 text-gray-800'; 
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;

  // ===== Rendu principal =====
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-right" />
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-2xl font-bold text-gray-800">Performances des employés</h1>
          <button 
            onClick={() => setShowModal(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus size={18} /> Ajouter
          </button>
        </div>

        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {apiError}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Matricule</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Nom</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider hidden md:table-cell">Objectif</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Réalisation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Évaluation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {performances.map((perf, index) => (
                  <tr key={perf._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50 hover:bg-gray-100'}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{getMatricule(perf, employees)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{getEmployeeName(perf.employe, employees)}</td>
                    <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate hidden md:table-cell" title={perf.objectif}>{perf.objectif}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(perf.realisation)}`}>
                        {perf.realisation}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEvaluationBadgeClass(perf.evaluation)}`}>
                        {perf.evaluation}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleView(perf)} 
                          className="text-indigo-600 hover:text-indigo-900 p-2 rounded-lg hover:bg-indigo-50 transition-colors"
                          title="Voir détails"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => handleEdit(perf)} 
                          className="text-yellow-600 hover:text-yellow-900 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                          title="Modifier"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(perf._id!, perf)} 
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {performances.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <p>Aucune performance à afficher pour le moment.</p>
            </div>
          )}
        </div>

        {/* Modal Ajout / Édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">{editingPerformance ? 'Modifier' : 'Ajouter'} performance</h2>
                <button 
                  onClick={() => { setShowModal(false); setEditingPerformance(null); setEmployeeInfo(null); }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="mb-4 flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Matricule" 
                    value={formData.matricule} 
                    onChange={e => setFormData(prev => ({ ...prev, matricule: e.target.value }))} 
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  />
                  <button 
                    onClick={searchEmployee} 
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Rechercher
                  </button>
                </div>

                {employeeInfo && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-800">Employé trouvé: {employeeInfo.prenom} {employeeInfo.nom}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                  <input 
                    type="text" 
                    placeholder="Objectif" 
                    value={formData.objectif} 
                    onChange={e => setFormData(prev => ({ ...prev, objectif: e.target.value }))} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    required 
                  />
                  <textarea 
                    placeholder="Description" 
                    value={formData.description} 
                    onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                    rows={3}
                    required 
                  />
                  <select 
                    value={formData.realisation} 
                    onChange={e => setFormData(prev => ({ ...prev, realisation: e.target.value as Performance['realisation'] }))} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Non démarré">Non démarré</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                  <select 
                    value={formData.evaluation} 
                    onChange={e => setFormData(prev => ({ ...prev, evaluation: e.target.value as Performance['evaluation'] }))} 
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Excellent">Excellent</option>
                    <option value="Bon">Bon</option>
                    <option value="Moyen">Moyen</option>
                    <option value="Insuffisant">Insuffisant</option>
                  </select>
                  <button 
                    type="submit" 
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    disabled={!employeeInfo}
                  >
                    {editingPerformance ? 'Modifier' : 'Ajouter'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal Vue */}
        {showViewModal && selectedPerformance && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl">
              <div className="flex justify-between items-center p-6 border-b">
                <h2 className="text-xl font-bold text-gray-800">Détails de la performance</h2>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <strong className="block text-sm text-gray-600 mb-1">Nom:</strong>
                  <p>{getEmployeeName(selectedPerformance.employe, employees)}</p>
                </div>
                <div>
                  <strong className="block text-sm text-gray-600 mb-1">Objectif:</strong>
                  <p>{selectedPerformance.objectif}</p>
                </div>
                <div>
                  <strong className="block text-sm text-gray-600 mb-1">Description:</strong>
                  <p>{selectedPerformance.description}</p>
                </div>
                <div>
                  <strong className="block text-sm text-gray-600 mb-1">Réalisation:</strong>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedPerformance.realisation)}`}>
                    {selectedPerformance.realisation}
                  </span>
                </div>
                <div>
                  <strong className="block text-sm text-gray-600 mb-1">Évaluation:</strong>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getEvaluationBadgeClass(selectedPerformance.evaluation)}`}>
                    {selectedPerformance.evaluation}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};