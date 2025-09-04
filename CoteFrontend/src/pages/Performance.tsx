import React, { useState, useEffect } from 'react';
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
import { Edit3, Trash2, Plus, Eye, X, User, FileText } from 'lucide-react';

import { getEmployees, type Employee } from '../Components/ServiceEmployer';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Performance {
  _id: string;
  employe: Employee;
  objectif: string;
  description: string;
  realisation: string;
  evaluation: string;
}

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const emps = await getEmployees();
        setEmployees(emps);
        
        // Données de démonstration
        const mockData: Performance[] = [
          {
            _id: '1',
            employe: emps[0] || { matricule: 'EMP001', nom: 'Dupont', prenom: 'Jean', poste: 'Développeur', departement: { nom: 'IT' } },
            objectif: 'Terminer le projet X',
            description: 'Développer les fonctionnalités principales',
            realisation: 'Terminé',
            evaluation: 'Excellent'
          },
          {
            _id: '2', 
            employe: emps[1] || { matricule: 'EMP002', nom: 'Martin', prenom: 'Sophie', poste: 'Designer', departement: { nom: 'Design' } },
            objectif: 'Concevoir interface utilisateur',
            description: 'Créer une interface moderne et responsive',
            realisation: 'En cours',
            evaluation: 'Bon'
          }
        ];
        setPerformances(mockData);
      } catch (error) {
        console.error('Erreur chargement données:', error);
        toast.error('Erreur lors du chargement des données');
      }
    };
    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.matricule || !formData.objectif) {
      toast.error("Le matricule et l'objectif sont obligatoires");
      return;
    }

    const employee = employees.find(emp => emp.matricule === formData.matricule);
    if (!employee) {
      toast.error("Employé introuvable");
      return;
    }

    if (editingPerformance) {
      // Modification
      const updatedPerformances = performances.map(perf =>
        perf._id === editingPerformance._id
          ? {
              ...perf,
              employe: employee,
              objectif: formData.objectif,
              description: formData.description,
              realisation: formData.realisation,
              evaluation: formData.evaluation
            }
          : perf
      );
      setPerformances(updatedPerformances);
      toast.success("Performance modifiée avec succès");
    } else {
      // Ajout
      const newPerformance: Performance = {
        _id: Date.now().toString(),
        employe: employee,
        objectif: formData.objectif,
        description: formData.description,
        realisation: formData.realisation,
        evaluation: formData.evaluation
      };
      setPerformances([...performances, newPerformance]);
      toast.success("Performance ajoutée avec succès");
    }

    setShowModal(false);
    setEditingPerformance(null);
    setFormData({ matricule: '', objectif: '', description: '', realisation: 'Non démarré', evaluation: 'Moyen' });
  };

  const handleDelete = (id: string, performance: Performance) => {
    // Notification de confirmation élégante
    toast.info(
      <div className="p-4">
        <div className="text-lg font-semibold mb-2">Confirmer la suppression</div>
        <p className="mb-4">Êtes-vous sûr de vouloir supprimer la performance de {performance.employe.prenom} {performance.employe.nom} ?</p>
        <div className="flex space-x-2 justify-end">
          <button
            onClick={() => {
              toast.dismiss();
              setPerformances(prev => prev.filter(p => p._id !== id));
              toast.success("Performance supprimée avec succès");
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
      matricule: performance.employe.matricule,
      objectif: performance.objectif,
      description: performance.description,
      realisation: performance.realisation,
      evaluation: performance.evaluation
    });
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
                            {perf.employe.prenom} {perf.employe.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {perf.employe.matricule} • {perf.employe.poste}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {perf.objectif}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {perf.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(perf.realisation)}`}>
                        {perf.realisation}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEvaluationBadgeClass(perf.evaluation)}`}>
                        {perf.evaluation}
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
                          onClick={() => handleDelete(perf._id, perf)}
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
                <input
                  type="text"
                  value={formData.matricule}
                  onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  placeholder="Ex: EMP12345"
                />
              </div>

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
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
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
                    {selectedPerformance.employe.prenom} {selectedPerformance.employe.nom}
                  </h4>
                  <p className="text-sm text-gray-500">{selectedPerformance.employe.matricule}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poste</label>
                  <p className="text-sm text-gray-900">{selectedPerformance.employe.poste || '-'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
                  <p className="text-sm text-gray-900">{selectedPerformance.employe.departement?.nom || '-'}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Objectif</label>
                <p className="text-sm text-gray-900">{selectedPerformance.objectif}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{selectedPerformance.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Réalisation</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(selectedPerformance.realisation)}`}>
                    {selectedPerformance.realisation}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Évaluation</label>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getEvaluationBadgeClass(selectedPerformance.evaluation)}`}>
                    {selectedPerformance.evaluation}
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