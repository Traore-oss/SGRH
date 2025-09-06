// import React, { useState, useEffect } from 'react';
import { Plus, Users, Edit, Trash2 } from 'lucide-react';
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
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        {title && <h2 className="text-lg font-bold mb-4">{title}</h2>}
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-gray-700">✖</button>
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
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[type];

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg text-white ${bgColor} flex items-center space-x-3`}>
      <span>{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-200">✖</button>
    </div>
  );
};

export const Departments: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [newDept, setNewDept] = useState<Department>({
    nom: '',
    code_departement: '',
    chef: '',
    effectif: 0,
    budget: 0,
    description: ''
  });
  const [notification, setNotification] = useState<{type: 'success' | 'error' | 'warning' | 'info', message: string} | null>(null);

  // 🔹 Afficher une notification
  const showNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message });
  };

  // 🔹 Charger les départements
  const fetchDepartments = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/departements/getAllDepartements');
      const data = await res.json();
      setDepartments(data.departements || []);
    } catch (err) {
      console.error('Erreur récupération départements:', err);
      showNotification('error', 'Erreur lors de la récupération des départements');
    }
  };

  // 🔹 Charger les employés
  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/Users/getAllEmployees', {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Erreur lors de la récupération des employés');
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
      const res = await fetch('http://localhost:8000/api/departements/createDepartement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newDept, effectif: Number(newDept.effectif), budget: Number(newDept.budget) })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message || 'Département créé avec succès');
        setShowAddModal(false);
        setNewDept({ nom: '', code_departement: '', chef: '', effectif: 0, budget: 0, description: '' });
        fetchDepartments();
      } else {
        showNotification('error', data.message || 'Erreur lors de la création du département');
      }
    } catch (err) {
      console.error('Erreur création département:', err);
      showNotification('error', 'Erreur serveur lors de la création du département');
    }
  };

  // 🔹 Modification d'un département
  const handleEditDepartment = async () => {
    if (!editingDept?.code_departement || !editingDept?.nom) {
      showNotification('warning', 'Le code et le nom du département sont obligatoires');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/api/departements/updateDepartement/${editingDept.code_departement}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingDept, effectif: Number(editingDept.effectif), budget: Number(editingDept.budget) })
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message || 'Département modifié avec succès');
        setShowEditModal(false);
        setEditingDept(null);
        fetchDepartments();
      } else {
        showNotification('error', data.message || 'Erreur lors de la modification du département');
      }
    } catch (err) {
      console.error('Erreur modification département:', err);
      showNotification('error', 'Erreur serveur lors de la modification du département');
    }
  };

  // 🔹 Suppression d'un département
  const handleDeleteDepartment = async (dept: Department) => {
    try {
      const res = await fetch(`http://localhost:8000/api/departements/deleteDepartement/${dept.code_departement}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message || 'Département supprimé avec succès');
        fetchDepartments();
      } else {
        showNotification('error', data.message || 'Erreur lors de la suppression du département');
      }
    } catch (err) {
      console.error(err);
      showNotification('error', 'Erreur serveur lors de la suppression du département');
    }
  };

  // 🔹 Ouvrir le modal de modification
  const openEditModal = (dept: Department) => {
    setEditingDept(dept);
    setShowEditModal(true);
  };

  const columns = [
    { key: 'nom', label: 'Nom du département' },
    { key: 'code_departement', label: 'Code' },
    { key: 'chef', label: 'Chef de département' },
    { key: 'effectif', label: 'Effectif' },
    { key: 'budget', label: 'Budget annuel' }
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
      onClick: handleDeleteDepartment, 
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
              {departments.reduce((sum, dept) => sum + (dept.budget || 0), 0).toLocaleString('fr-GN')} GNF
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
          <DataTable data={departments} columns={columns} actions={actions} emptyMessage="Aucun département trouvé" />
        </div>
      </div>

      {/* Add Department Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouveau Département">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Code département" className="w-full p-2 border rounded-lg" value={newDept.code_departement} onChange={e => setNewDept({ ...newDept, code_departement: e.target.value })} />
            <input type="text" placeholder="Nom du département" className="w-full p-2 border rounded-lg" value={newDept.nom} onChange={e => setNewDept({ ...newDept, nom: e.target.value })} />
          </div>
          <input type="text" placeholder="Chef de département" className="w-full p-2 border rounded-lg" value={newDept.chef} onChange={e => setNewDept({ ...newDept, chef: e.target.value })} />
          <input type="number" placeholder="Effectif" className="w-full p-2 border rounded-lg" value={newDept.effectif} onChange={e => setNewDept({ ...newDept, effectif: Number(e.target.value) })} />
          <input type="number" placeholder="Budget annuel" className="w-full p-2 border rounded-lg" value={newDept.budget} onChange={e => setNewDept({ ...newDept, budget: Number(e.target.value) })} />
          <textarea placeholder="Description" className="w-full p-2 border rounded-lg" value={newDept.description} onChange={e => setNewDept({ ...newDept, description: e.target.value })} />
          <div className="flex justify-end space-x-3">
            <button onClick={() => setShowAddModal(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
            <button onClick={handleCreateDepartment} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Créer</button>
          </div>
        </div>
      </Modal>

      {/* Edit Department Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le Département">
        {editingDept && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Code département" className="w-full p-2 border rounded-lg" value={editingDept.code_departement} onChange={e => setEditingDept({ ...editingDept, code_departement: e.target.value })} />
              <input type="text" placeholder="Nom du département" className="w-full p-2 border rounded-lg" value={editingDept.nom} onChange={e => setEditingDept({ ...editingDept, nom: e.target.value })} />
            </div>
            <input type="text" placeholder="Chef de département" className="w-full p-2 border rounded-lg" value={editingDept.chef} onChange={e => setEditingDept({ ...editingDept, chef: e.target.value })} />
            <input type="number" placeholder="Effectif" className="w-full p-2 border rounded-lg" value={editingDept.effectif} onChange={e => setEditingDept({ ...editingDept, effectif: Number(e.target.value) })} />
            <input type="number" placeholder="Budget annuel" className="w-full p-2 border rounded-lg" value={editingDept.budget} onChange={e => setEditingDept({ ...editingDept, budget: Number(e.target.value) })} />
            <textarea placeholder="Description" className="w-full p-2 border rounded-lg" value={editingDept.description} onChange={e => setEditingDept({ ...editingDept, description: e.target.value })} />
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 border rounded-lg">Annuler</button>
              <button onClick={handleEditDepartment} className="px-4 py-2 bg-green-600 text-white rounded-lg">Modifier</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};