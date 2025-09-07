import React, { useState, useEffect } from 'react';
import { 
  Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Eye, RefreshCw, Search, Filter 
} from 'lucide-react';
import { DataTable } from '../commons/DataTable';
import { Modal } from '../commons/Modal';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Employee {
  _id: string;
  prenom: string;
  nom: string;
  matricule: string;
  email: string;
}

interface Leave {
  _id: string;
  employe: Employee;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  isApproved: boolean | null;
  motif: string;
  createdAt: string;
  updatedAt: string;
  dateValidation?: string;
  commentaireResponsable?: string;
}

export const Leaves: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedConge, setSelectedConge] = useState<Leave | null>(null);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [formData, setFormData] = useState({
    matricule: '',
    typeConge: '',
    dateDebut: '',
    dateFin: '',
    motif: ''
  });

  const api = axios.create({
    baseURL: 'http://localhost:8000/api/conges',
    withCredentials: true
  });

  const fetchConges = async () => {
    try {
      setLoading(true);
      const response = await api.get('/getAllConges');

      if (response.data && Array.isArray(response.data)) {
        setLeaves(response.data);
        toast.success(`✅ ${response.data.length} demande(s) de congé chargée(s)`);
      } else {
        setLeaves([]);
        toast.info('ℹ️ Aucune demande de congé trouvée');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des congés:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du chargement des congés';
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchConges();
  };

  useEffect(() => {
    fetchConges();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/creerConge', formData);

      if (response.status === 201) {
        toast.success('✅ Demande de congé créée avec succès');
        setFormData({ matricule: '', typeConge: '', dateDebut: '', dateFin: '', motif: '' });
        setShowAddModal(false);
        fetchConges();
      }
    } catch (error: any) {
      console.error('Erreur lors de la création:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de la création de la demande';
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleApprouver = async (conge: Leave) => {
    try {
      const response = await api.put(`/approuverConge/${conge._id}`);

      if (response.status === 200) {
        toast.success('✅ Congé approuvé avec succès');
        fetchConges();
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'approbation:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors de l\'approbation';
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const handleRefuser = async (conge: Leave) => {
    try {
      const response = await api.put(`/refuserConge/${conge._id}`);

      if (response.status === 200) {
        toast.success('✅ Congé refusé avec succès');
        fetchConges();
      }
    } catch (error: any) {
      console.error('Erreur lors du refus:', error);
      const errorMessage = error.response?.data?.message || 'Erreur lors du refus';
      toast.error(`❌ ${errorMessage}`);
    }
  };

  const getStatusIcon = (conge: Leave) => {
    if (conge.isApproved === true) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (conge.isApproved === false) return <XCircle className="h-4 w-4 text-red-600" />;
    return <AlertCircle className="h-4 w-4 text-yellow-600" />;
  };

  const getStatusBadge = (conge: Leave) => {
    const baseClasses = "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium";
    if (conge.isApproved === true) return `${baseClasses} bg-green-100 text-green-800`;
    if (conge.isApproved === false) return `${baseClasses} bg-red-100 text-red-800`;
    return `${baseClasses} bg-yellow-100 text-yellow-800`;
  };

  const getStatusText = (conge: Leave) => {
    if (conge.isApproved === true) return 'Approuvé';
    if (conge.isApproved === false) return 'Refusé';
    return 'En attente';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredLeaves = leaves.filter(leave => {
    const matchesSearch = 
      (leave.employe?.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (leave.employe?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (leave.employe?.matricule?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      leave.typeConge.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'pending' && leave.isApproved === null) ||
      (statusFilter === 'approved' && leave.isApproved === true) ||
      (statusFilter === 'rejected' && leave.isApproved === false);

    const matchesType = typeFilter === 'all' || leave.typeConge === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const uniqueTypes = Array.from(new Set(leaves.map(leave => leave.typeConge)));

  const columns = [
    {
      key: 'employe',
      label: 'Employé',
      render: (_: any, row: Leave) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.employe?.prenom} {row.employe?.nom}
          </div>
          <div className="text-sm text-gray-500">
            📋 Mat: {row.employe?.matricule || 'N/A'}
          </div>
        </div>
      )
    },
    { 
      key: 'typeConge', 
      label: 'Type',
      render: (value: string) => (
        <span className="font-medium text-gray-700">{value}</span>
      )
    },
    { 
      key: 'dateDebut', 
      label: 'Date début', 
      render: (value: string) => (
        <div className="text-sm text-gray-600">{formatDate(value)}</div>
      )
    },
    { 
      key: 'dateFin', 
      label: 'Date fin', 
      render: (value: string) => (
        <div className="text-sm text-gray-600">{formatDate(value)}</div>
      )
    },
    { 
      key: 'nbJours', 
      label: 'Durée',
      render: (value: number) => (
        <span className="font-medium text-blue-600">{value} jour(s)</span>
      )
    },
    {
      key: 'statut',
      label: 'Statut',
      render: (_: any, row: Leave) => (
        <span className={getStatusBadge(row)}>
          {getStatusIcon(row)}
          <span className="font-medium">{getStatusText(row)}</span>
        </span>
      )
    }
  ];

  const actions = [
    { 
      icon: Eye, 
      label: 'Voir détails', 
      onClick: (row: Leave) => { setSelectedConge(row); setShowViewModal(true); }, 
      color: 'text-blue-600 hover:text-blue-700' 
    },
    { 
      icon: CheckCircle, 
      label: 'Approuver', 
      onClick: handleApprouver, 
      color: 'text-green-600 hover:text-green-700', 
      show: (row: Leave) => row.isApproved === null 
    },
    { 
      icon: XCircle, 
      label: 'Refuser', 
      onClick: handleRefuser, 
      color: 'text-red-600 hover:text-red-700', 
      show: (row: Leave) => row.isApproved === null 
    }
  ];

  const stats = {
    enAttente: leaves.filter(c => c.isApproved === null).length,
    approuves: leaves.filter(c => c.isApproved === true).length,
    refuses: leaves.filter(c => c.isApproved === false).length,
    ceMois: leaves.filter(c => {
      const date = new Date(c.dateDebut);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  return (
    <div className="p-4 md:p-6 space-y-6">

      <ToastContainer position="top-right" autoClose={5000} />

      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestion des Congés</h1>
          <p className="text-gray-600">Gérez les demandes de congé de vos employés</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Chargement...' : 'Rafraîchir'}</span>
          </button>
          <button 
            onClick={() => setShowAddModal(true)} 
            className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Nouvelle Demande</span>
          </button>
        </div>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'En attente', value: stats.enAttente, color: 'bg-yellow-500', icon: Clock },
          { title: 'Approuvés', value: stats.approuves, color: 'bg-green-500', icon: CheckCircle },
          { title: 'Refusés', value: stats.refuses, color: 'bg-red-500', icon: XCircle },
          { title: 'Ce mois', value: stats.ceMois, color: 'bg-blue-500', icon: Calendar }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 md:p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <div>
                <p className="text-xl md:text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm md:text-base text-gray-600">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filtres et recherche */}
      <div className="bg-white p-4 md:p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Demandes de Congé</h3>
            <p className="text-sm text-gray-500">{filteredLeaves.length} demande(s) sur {leaves.length} total</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-4 w-4" />
              <span>Filtres</span>
            </button>
          </div>
        </div>

        {/* Barre de recherche */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, matricule, type ou motif..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtres avancés */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Statut</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les statuts</option>
                <option value="pending">En attente</option>
                <option value="approved">Approuvés</option>
                <option value="rejected">Refusés</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Type de congé</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les types</option>
                {uniqueTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setTypeFilter('all');
                  setSearchTerm('');
                }}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <DataTable
            data={filteredLeaves}
            columns={columns}
            actions={actions}
            emptyMessage="Aucune demande de congé trouvée"
            loading={loading}
          />
        </div>
      </div>

      {/* Modal Nouvelle Demande */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Nouvelle Demande de Congé" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="matricule" className="block text-sm font-medium text-gray-700 mb-1">Matricule Employé *</label>
              <input
                type="text"
                id="matricule"
                value={formData.matricule}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
                placeholder="Ex: EMP001"
              />
            </div>
            <div>
              <label htmlFor="typeConge" className="block text-sm font-medium text-gray-700 mb-1">Type de congé *</label>
              <select
                id="typeConge"
                value={formData.typeConge}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              >
                <option value="">-- Sélectionner --</option>
                <option value="Congés payés">Congés payés</option>
                <option value="Congé maladie">Congé maladie</option>
                <option value="Congé maternité">Congé maternité</option>
                <option value="Congé paternité">Congé paternité</option>
                <option value="Absence exceptionnelle">Absence exceptionnelle</option>
              </select>
            </div>
            <div>
              <label htmlFor="dateDebut" className="block text-sm font-medium text-gray-700 mb-1">Date de début *</label>
              <input
                type="date"
                id="dateDebut"
                value={formData.dateDebut}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label htmlFor="dateFin" className="block text-sm font-medium text-gray-700 mb-1">Date de fin *</label>
              <input
                type="date"
                id="dateFin"
                value={formData.dateFin}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="motif" className="block text-sm font-medium text-gray-700 mb-1">Motif</label>
            <textarea
              id="motif"
              value={formData.motif}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-lg"
              placeholder="Décrivez le motif de la demande..."
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Annuler</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Enregistrer</button>
          </div>
        </form>
      </Modal>

      {/* Modal Détails Demande */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Détails de la Demande" size="lg">
        {selectedConge ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Employé</label>
                <p className="text-gray-900">{selectedConge.employe.prenom} {selectedConge.employe.nom}</p>
                <p className="text-sm text-gray-500">Matricule: {selectedConge.employe.matricule}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Type de congé</label>
                <p className="text-gray-900">{selectedConge.typeConge}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date début</label>
                <p className="text-gray-900">{formatDate(selectedConge.dateDebut)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date fin</label>
                <p className="text-gray-900">{formatDate(selectedConge.dateFin)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Durée</label>
                <p className="text-gray-900">{selectedConge.nbJours} jour(s)</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Statut</label>
                <span className={getStatusBadge(selectedConge)}>
                  {getStatusIcon(selectedConge)}
                  <span>{getStatusText(selectedConge)}</span>
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Motif</label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{selectedConge.motif}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Date de soumission</label>
                <p className="text-gray-900">{formatDateTime(selectedConge.createdAt)}</p>
              </div>
              {selectedConge.dateValidation && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">Date de validation</label>
                  <p className="text-gray-900">{formatDateTime(selectedConge.dateValidation)}</p>
                </div>
              )}
            </div>
            {selectedConge.commentaireResponsable && (
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">Commentaire du responsable</label>
                <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg">{selectedConge.commentaireResponsable}</p>
              </div>
            )}
          </div>
        ) : (
          <p>Aucune donnée disponible</p>
        )}
      </Modal>
    </div>
  );
};
