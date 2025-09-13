import { Edit, Plus, Trash2, Users, X, Check, AlertCircle, Info } from 'lucide-react';
import { DataTable } from '../commons/DataTable';
import { useEffect, useState } from 'react';

// 🔹 Type Department
interface Department {
  _id?: string;
  nom: string;
  code_departement: string;
  chef: string;
  effectif: number;
  budget: number;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

// 🔹 Interface pour un employé
interface Employee {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  departement?: string;
  salaire: string | number;
  typeContrat: 'CDI' | 'CDD';
  role: string;
  photo?: string;
}

// 🔹 Composant Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4">
      <div className={`bg-white rounded-lg shadow-lg w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto p-6 relative`}>
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors">
          <X className="h-5 w-5" />
        </button>
        {children}
      </div>
    </div>
  );
};

// 🔹 Composant Notification
interface NotificationProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type];

  const icon = {
    success: <Check className="h-5 w-5" />,
    error: <X className="h-5 w-5" />,
    warning: <AlertCircle className="h-5 w-5" />,
    info: <Info className="h-5 w-5" />
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} flex items-center space-x-3 animate-fade-in`}>
      {icon}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

// 🔹 Composant Confirmation Modal
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  type = 'danger'
}) => {
  if (!isOpen) return null;

  const buttonColor = {
    danger: 'bg-red-600 hover:bg-red-700',
    warning: 'bg-yellow-600 hover:bg-yellow-700',
    info: 'bg-blue-600 hover:bg-blue-700'
  }[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors ${buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deletingDept, setDeletingDept] = useState<Department | null>(null);
  const [newDept, setNewDept] = useState<Department>({
    nom: '',
    code_departement: '',
    chef: '',
    effectif: 0,
    budget: 0,
    description: ''
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'warning' | 'info', message: string} | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Afficher une notification
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message });
  };

  // 🔹 Charger les départements
  const fetchDepartments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("http://localhost:8000/api/departements/getAllDepartements", {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          showNotification("error", "Session expirée. Veuillez vous reconnecter.");
          return;
        }
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setDepartments(data.departements || []);
    } catch (err) {
      console.error("Erreur récupération départements:", err);
      showNotification("error", "Erreur lors de la récupération des départements");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Charger les employés
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/Users/', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          showNotification('error', 'Session expirée. Veuillez vous reconnecter.');
          return;
        }
        throw new Error(`Erreur ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setEmployees(data || []);
    } catch (err) {
      console.error('Erreur récupération employés:', err);
      showNotification('error', 'Erreur lors de la récupération des employés');
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  // 🔹 Calculer le total des employés
  const totalEmployees = employees.length;

  // 🔹 Création d'un département
  const handleCreateDepartment = async () => {
    if (!newDept.code_departement || !newDept.nom) {
      showNotification('warning', 'Le code et le nom du département sont obligatoires');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('http://localhost:8000/api/departements/createDepartement', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newDept,
          effectif: Number(newDept.effectif),
          budget: Number(newDept.budget)
        })
      });

      const data = await res.json();

      if (res.ok) {
        showNotification('success', data.message || 'Département créé avec succès');
        setShowAddModal(false);
        setNewDept({ nom: '', code_departement: '', chef: '', effectif: 0, budget: 0, description: '' });
        fetchDepartments();
      } else {
        if (res.status === 401) {
          showNotification('error', 'Session expirée. Veuillez vous reconnecter.');
        } else if (res.status === 409) {
          showNotification('error', data.message || 'Ce code département existe déjà');
        } else {
          showNotification('error', data.message || 'Erreur lors de la création du département');
        }
      }
    } catch (err) {
      console.error('Erreur création département:', err);
      showNotification('error', 'Erreur serveur lors de la création du département');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Modification d'un département
  const handleEditDepartment = async () => {
    if (!editingDept?.code_departement || !editingDept?.nom) {
      showNotification('warning', 'Le code et le nom du département sont obligatoires');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:8000/api/departements/updateDepartement/${editingDept.code_departement}`,
        {
          method: 'PUT',
          credentials: 'include',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            nom: editingDept.nom, 
            chef: editingDept.chef || '', 
            effectif: Number(editingDept.effectif) || 0, 
            budget: Number(editingDept.budget) || 0, 
            description: editingDept.description || '' 
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        showNotification('success', data.message || 'Département modifié avec succès');
        setShowEditModal(false);
        setEditingDept(null);
        fetchDepartments();
      } else {
        if (res.status === 401) {
          showNotification('error', 'Session expirée. Veuillez vous reconnecter.');
        } else if (res.status === 404) {
          showNotification('error', data.message || 'Département non trouvé');
        } else {
          showNotification('error', data.message || 'Erreur lors de la modification du département');
        }
      }
    } catch (err) {
      console.error('Erreur modification département:', err);
      showNotification('error', 'Erreur serveur lors de la modification du département');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Suppression d'un département
  const handleDeleteDepartment = async () => {
    if (!deletingDept) return;

    try {
      setIsLoading(true);
      const res = await fetch(
        `http://localhost:8000/api/departements/deleteDepartement/${deletingDept.code_departement}`,
        {
          method: 'DELETE',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      const data = await res.json();

      if (res.ok) {
        showNotification('success', data.message || 'Département supprimé avec succès');
        setShowDeleteModal(false);
        setDeletingDept(null);
        fetchDepartments();
      } else {
        if (res.status === 401) {
          showNotification('error', 'Session expirée. Veuillez vous reconnecter.');
        } else if (res.status === 404) {
          showNotification('error', data.message || 'Département non trouvé');
        } else {
          showNotification('error', data.message || 'Erreur lors de la suppression du département');
        }
      }
    } catch (err) {
      console.error('Erreur suppression département:', err);
      showNotification('error', 'Erreur serveur lors de la suppression du département');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔹 Ouvrir le modal de modification
  const openEditModal = (dept: Department) => {
    setEditingDept({...dept});
    setShowEditModal(true);
  };

  // 🔹 Ouvrir le modal de suppression
  const openDeleteModal = (dept: Department) => {
    setDeletingDept(dept);
    setShowDeleteModal(true);
  };

  const columns = [
    { key: 'nom', label: 'Nom du département' },
    { key: 'code_departement', label: 'Code' },
    { key: 'chef', label: 'Chef de département' },
    { key: 'effectif', label: 'Effectif' },
    { key: 'budget', label: 'Budget annuel', format: (value: number) => `${value.toLocaleString('fr-FR')} GNF` }
  ];

  const actions = [
    { 
      icon: Edit, 
      label: 'Modifier', 
      onClick: (row: Department) => openEditModal(row), 
      color: 'text-green-600' 
    },
    { 
      icon: Trash2, 
      label: 'Supprimer', 
      onClick: (row: Department) => openDeleteModal(row), 
      color: 'text-red-600' 
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Notification */}
      {notification && (
        <Notification 
          type={notification.type} 
          message={notification.message} 
          onClose={() => setNotification(null)} 
        />
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span>Traitement en cours...</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-blue-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{departments.length}</p>
            <p className="text-sm text-gray-500">Départements</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-green-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">{totalEmployees}</p>
            <p className="text-sm text-gray-500">Total employés</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-yellow-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {departments.length ? Math.round(totalEmployees / departments.length) : 0}
            </p>
            <p className="text-sm text-gray-500">Effectif moyen</p>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-purple-500">
            <Users className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800">
              {departments.reduce((sum, dept) => sum + (dept.budget || 0), 0).toLocaleString('fr-FR')} GNF
            </p>
            <p className="text-sm text-gray-500">Budget total</p>
          </div>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Départements</h3>
            <p className="text-sm text-gray-500">Gérez l'organisation de votre entreprise</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouveau Département</span>
          </button>
        </div>
        <div className="overflow-x-auto">
          <DataTable 
            data={departments} 
            columns={columns} 
            actions={actions} 
            emptyMessage="Aucun département trouvé" 
          />
        </div>
      </div>

      {/* Add Department Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouveau Département" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code département *</label>
              <input 
                type="text" 
                placeholder="Ex: DEV, MKT, FIN" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={newDept.code_departement} 
                onChange={e => setNewDept({ ...newDept, code_departement: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom du département *</label>
              <input 
                type="text" 
                placeholder="Ex: Développement, Marketing" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={newDept.nom} 
                onChange={e => setNewDept({ ...newDept, nom: e.target.value })} 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chef de département</label>
            <input 
              type="text" 
              placeholder="Nom du responsable" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={newDept.chef} 
              onChange={e => setNewDept({ ...newDept, chef: e.target.value })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Effectif</label>
            <input 
              type="number" 
              placeholder="Nombre d'employés" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={newDept.effectif} 
              onChange={e => setNewDept({ ...newDept, effectif: Number(e.target.value) })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Budget annuel (GNF)</label>
            <input 
              type="number" 
              placeholder="Budget alloué" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              value={newDept.budget} 
              onChange={e => setNewDept({ ...newDept, budget: Number(e.target.value) })} 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea 
              placeholder="Description du département" 
              className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
              rows={3}
              value={newDept.description} 
              onChange={e => setNewDept({ ...newDept, description: e.target.value })} 
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button 
              onClick={() => setShowAddModal(false)} 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={handleCreateDepartment} 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              disabled={isLoading}
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>Créer</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le Département" size="lg">
        {editingDept && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Code département *</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={editingDept.code_departement} 
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Le code ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom du département *</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={editingDept.nom} 
                  onChange={e => setEditingDept({ ...editingDept, nom: e.target.value })} 
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Chef de département</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={editingDept.chef} 
                onChange={e => setEditingDept({ ...editingDept, chef: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effectif</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={editingDept.effectif} 
                onChange={e => setEditingDept({ ...editingDept, effectif: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Budget annuel (GNF)</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                value={editingDept.budget} 
                onChange={e => setEditingDept({ ...editingDept, budget: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                rows={3}
                value={editingDept.description} 
                onChange={e => setEditingDept({ ...editingDept, description: e.target.value })} 
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button 
                onClick={() => setShowEditModal(false)} 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button 
                onClick={handleEditDepartment} 
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                disabled={isLoading}
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>Modifier</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteDepartment}
        title="Supprimer le département"
        message={`Êtes-vous sûr de vouloir supprimer le département "${deletingDept?.nom}" ? Cette action est irréversible.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
      />
    </div>
  );
};