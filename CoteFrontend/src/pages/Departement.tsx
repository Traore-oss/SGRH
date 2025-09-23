// import { Edit, Plus, Trash2, Users, X, Check, AlertCircle, Info, Building2, DollarSign, Target } from 'lucide-react';
import { DataTable } from '../commons/DataTable';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Building2, Check, DollarSign, Edit, Info, Plus, Target, Trash2, Users, X } from 'lucide-react';

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
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto p-6 relative`}
          >
            {title && (
              <div className="border-b border-gray-200 pb-4 mb-4">
                <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              </div>
            )}
            <button 
              onClick={onClose} 
              className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} flex items-center space-x-3`}
    >
      {icon}
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
        <X className="h-4 w-4" />
      </button>
    </motion.div>
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
  const buttonColor = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500',
    info: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
  }[type];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="p-4 bg-red-50 rounded-lg border border-red-200">
          <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-gray-600 text-center">{message}</p>
        </div>
        <div className="flex justify-end space-x-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-white rounded-lg transition-colors focus:ring-2 focus:outline-none ${buttonColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// 🔹 Composant de Carte Statistique
interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  color: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ icon, value, label, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
  >
    <div className="flex items-center space-x-4">
      <div className={`p-3 rounded-xl ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  </motion.div>
);

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
      color: 'text-green-600 hover:text-green-800' 
    },
    { 
      icon: Trash2, 
      label: 'Supprimer', 
      onClick: (row: Department) => openDeleteModal(row), 
      color: 'text-red-600 hover:text-red-800' 
    }
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <Notification 
            type={notification.type} 
            message={notification.message} 
            onClose={() => setNotification(null)} 
          />
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-3"
            >
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="text-gray-700">Traitement en cours...</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Départements</h1>
          <p className="text-gray-600">Organisez et gérez les départements de votre entreprise</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="h-5 w-5" />
          <span>Nouveau Département</span>
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Building2 className="h-6 w-6 text-white" />}
          value={departments.length}
          label="Départements"
          color="bg-blue-500"
          delay={0}
        />
        <StatCard
          icon={<Users className="h-6 w-6 text-white" />}
          value={totalEmployees}
          label="Total employés"
          color="bg-green-500"
          delay={1}
        />
        <StatCard
          icon={<Target className="h-6 w-6 text-white" />}
          value={departments.length ? Math.round(totalEmployees / departments.length) : 0}
          label="Effectif moyen"
          color="bg-yellow-500"
          delay={2}
        />
        <StatCard
          icon={<DollarSign className="h-10 w-10 text-white" />}
          value={`${departments.reduce((sum, dept) => sum + (dept.budget || 0), 0).toLocaleString('fr-FR')} GNF`}
          label="Budget total"
          color="bg-purple-500"
          delay={3}
        />
      </div>

      {/* Departments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Liste des Départements</h3>
          <p className="text-sm text-gray-500">Gérez l'organisation de votre entreprise</p>
        </div>
        <div className="overflow-x-auto">
          <DataTable 
            data={departments} 
            columns={columns} 
            actions={actions} 
            emptyMessage="Aucun département trouvé" 
          />
        </div>
      </motion.div>

      {/* Add Department Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouveau Département" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Code département *</label>
              <input 
                type="text" 
                placeholder="Ex: DEV, MKT, FIN" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                value={newDept.code_departement} 
                onChange={e => setNewDept({ ...newDept, code_departement: e.target.value })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nom du département *</label>
              <input 
                type="text" 
                placeholder="Ex: Développement, Marketing" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                value={newDept.nom} 
                onChange={e => setNewDept({ ...newDept, nom: e.target.value })} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Chef de département</label>
            <input 
              type="text" 
              placeholder="Nom du responsable" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
              value={newDept.chef} 
              onChange={e => setNewDept({ ...newDept, chef: e.target.value })} 
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Effectif</label>
              <input 
                type="number" 
                placeholder="Nombre d'employés" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                value={newDept.effectif} 
                onChange={e => setNewDept({ ...newDept, effectif: Number(e.target.value) })} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget annuel (GNF)</label>
              <input 
                type="number" 
                placeholder="Budget alloué" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                value={newDept.budget} 
                onChange={e => setNewDept({ ...newDept, budget: Number(e.target.value) })} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea 
              placeholder="Description du département" 
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
              rows={3}
              value={newDept.description} 
              onChange={e => setNewDept({ ...newDept, description: e.target.value })} 
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(false)} 
              className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              Annuler
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateDepartment} 
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              disabled={isLoading}
            >
              {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              <span>Créer le département</span>
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le Département" size="lg">
        {editingDept && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Code département *</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                  value={editingDept.code_departement} 
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Le code ne peut pas être modifié</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Nom du département *</label>
                <input 
                  type="text" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  value={editingDept.nom} 
                  onChange={e => setEditingDept({ ...editingDept, nom: e.target.value })} 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Chef de département</label>
              <input 
                type="text" 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                value={editingDept.chef} 
                onChange={e => setEditingDept({ ...editingDept, chef: e.target.value })} 
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Effectif</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  value={editingDept.effectif} 
                  onChange={e => setEditingDept({ ...editingDept, effectif: Number(e.target.value) })} 
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget annuel (GNF)</label>
                <input 
                  type="number" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors" 
                  value={editingDept.budget} 
                  onChange={e => setEditingDept({ ...editingDept, budget: Number(e.target.value) })} 
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea 
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none" 
                rows={3}
                value={editingDept.description} 
                onChange={e => setEditingDept({ ...editingDept, description: e.target.value })} 
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowEditModal(false)} 
                className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                Annuler
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleEditDepartment} 
                className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 focus:ring-2 focus:ring-green-500 focus:outline-none"
                disabled={isLoading}
              >
                {isLoading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>Modifier</span>
              </motion.button>
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