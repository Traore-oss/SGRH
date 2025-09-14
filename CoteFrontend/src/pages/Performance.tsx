/* eslint-disable @typescript-eslint/no-explicit-any */
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

export const addPerformance = async (
  perf: Omit<Performance, '_id' | 'createdAt' | 'updatedAt'> & { matricule: string }
): Promise<Performance> => {
  const performanceData = {
    ...perf,
    matricule: perf.matricule, // obligatoire pour le backend
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
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeInfo) return toast.error("Veuillez rechercher un employé");

    if (editingPerformance && editingPerformance._id) {
      const updatedPerf: Omit<Performance, 'createdAt' | 'updatedAt'> = {
        _id: editingPerformance._id,
        employe: formData.employeId,
        objectif: formData.objectif,
        description: formData.description,
        realisation: formData.realisation,
        evaluation: formData.evaluation
      };
      try {
        const result = await updatePerformance(editingPerformance._id, updatedPerf);
        setPerformances(prev => prev.map(p => p._id === editingPerformance._id ? { ...result, employe: employeeInfo } : p));
        toast.success("Performance modifiée avec succès");
      } catch {
        toast.error("Erreur lors de la modification");
      }
    } else {
      const newPerf: Omit<Performance, '_id' | 'createdAt' | 'updatedAt'> & { rh: string } = {
        employe: formData.employeId,
        objectif: formData.objectif,
        description: formData.description,
        realisation: formData.realisation,
        evaluation: formData.evaluation,
        rh: formData.rhId || ''
      };
      try {
        const result = await addPerformance(newPerf);
        setPerformances(prev => [...prev, { ...result, employe: employeeInfo }]);
        toast.success("Performance ajoutée avec succès");
      } catch {
        toast.error("Erreur lors de l'ajout");
      }
    }
    setShowModal(false);
    setEditingPerformance(null);
    setFormData({ employeId: '', matricule: '', objectif: '', description: '', realisation: 'Non démarré', evaluation: 'Moyen', rhId: '' });
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
    <div className="min-h-screen bg-gray-50">
      <ToastContainer position="top-right" />
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Performances des employés</h1>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            <Plus size={18} /> Ajouter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow rounded-lg overflow-hidden">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2 text-left">Matricule</th>
                <th className="px-4 py-2 text-left">Nom</th>
                <th className="px-4 py-2 text-left">Objectif</th>
                <th className="px-4 py-2 text-left">Réalisation</th>
                <th className="px-4 py-2 text-left">Évaluation</th>
                <th className="px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {performances.map((perf) => (
                <tr key={perf._id} className="border-b">
                  <td className="px-4 py-2">{getMatricule(perf, employees)}</td>
                  <td className="px-4 py-2">{getEmployeeName(perf.employe, employees)}</td>
                  <td className="px-4 py-2">{perf.objectif}</td>
                  <td className={`px-4 py-2 font-semibold ${getStatusBadgeClass(perf.realisation)}`}>{perf.realisation}</td>
                  <td className={`px-4 py-2 font-semibold ${getEvaluationBadgeClass(perf.evaluation)}`}>{perf.evaluation}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button onClick={() => handleView(perf)} className="p-2 bg-gray-200 rounded hover:bg-gray-300"><Eye size={16} /></button>
                    <button onClick={() => handleEdit(perf)} className="p-2 bg-yellow-200 rounded hover:bg-yellow-300"><Edit3 size={16} /></button>
                    <button onClick={() => handleDelete(perf._id!, perf)} className="p-2 bg-red-200 rounded hover:bg-red-300"><Trash2 size={16} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Ajout / Édition */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">{editingPerformance ? 'Modifier' : 'Ajouter'} performance</h2>
                <button onClick={() => { setShowModal(false); setEditingPerformance(null); setEmployeeInfo(null); }}><X /></button>
              </div>

              <div className="mb-4 flex gap-2">
                <input type="text" placeholder="Matricule" value={formData.matricule} onChange={e => setFormData(prev => ({ ...prev, matricule: e.target.value }))} className="flex-1 px-3 py-2 border rounded" />
                <button onClick={searchEmployee} className="px-4 py-2 bg-blue-600 text-white rounded">Rechercher</button>
              </div>

              {employeeInfo && <div className="mb-4">Nom: {employeeInfo.prenom} {employeeInfo.nom}</div>}

              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <input type="text" placeholder="Objectif" value={formData.objectif} onChange={e => setFormData(prev => ({ ...prev, objectif: e.target.value }))} className="px-3 py-2 border rounded" required />
                <textarea placeholder="Description" value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} className="px-3 py-2 border rounded" required />
                <select value={formData.realisation} onChange={e => setFormData(prev => ({ ...prev, realisation: e.target.value as Performance['realisation'] }))} className="px-3 py-2 border rounded">
                  <option>Non démarré</option>
                  <option>En cours</option>
                  <option>Terminé</option>
                </select>
                <select value={formData.evaluation} onChange={e => setFormData(prev => ({ ...prev, evaluation: e.target.value as Performance['evaluation'] }))} className="px-3 py-2 border rounded">
                  <option>Excellent</option>
                  <option>Bon</option>
                  <option>Moyen</option>
                  <option>Insuffisant</option>
                </select>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">{editingPerformance ? 'Modifier' : 'Ajouter'}</button>
              </form>
            </div>
          </div>
        )}

        {/* Modal Vue */}
        {showViewModal && selectedPerformance && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Détails de la performance</h2>
                <button onClick={() => setShowViewModal(false)}><X /></button>
              </div>
              <div className="space-y-2">
                <p><strong>Nom:</strong> {getEmployeeName(selectedPerformance.employe, employees)}</p>
                <p><strong>Objectif:</strong> {selectedPerformance.objectif}</p>
                <p><strong>Description:</strong> {selectedPerformance.description}</p>
                <p><strong>Réalisation:</strong> {selectedPerformance.realisation}</p>
                <p><strong>Évaluation:</strong> {selectedPerformance.evaluation}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
