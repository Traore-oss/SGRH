
import React, { useState } from 'react';
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { DataTable } from '../commons/DataTable';
import { Modal } from '../commons/Modal';

export const Leaves: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [leaves] = useState([
    {
      id: 1,
      employe: 'Pierre Martin',
      type: 'Congés payés',
      dateDebut: '15/06/2024',
      dateFin: '29/06/2024',
      duree: '10 jours',
      statut: 'En attente',
      motif: 'Vacances d\'été',
      demandeLe: '05/06/2024'
    },
    {
      id: 2,
      employe: 'Marie Dubois',
      type: 'Congé maladie',
      dateDebut: '10/06/2024',
      dateFin: '12/06/2024',
      duree: '3 jours',
      statut: 'Approuvé',
      motif: 'Consultation médicale',
      demandeLe: '08/06/2024'
    },
    {
      id: 3,
      employe: 'Julie Moreau',
      type: 'Congés payés',
      dateDebut: '01/07/2024',
      dateFin: '15/07/2024',
      duree: '11 jours',
      statut: 'Refusé',
      motif: 'Vacances familiales',
      demandeLe: '25/05/2024'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approuvé':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'Refusé':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = "inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium";
    switch (status) {
      case 'Approuvé':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Refusé':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
    }
  };

  const columns = [
    { key: 'employe', label: 'Employé' },
    { key: 'type', label: 'Type' },
    { key: 'dateDebut', label: 'Date début' },
    { key: 'dateFin', label: 'Date fin' },
    { key: 'duree', label: 'Durée' },
    { 
      key: 'statut', 
      label: 'Statut',
      render: (value: string) => (
        <span className={getStatusBadge(value)}>
          {getStatusIcon(value)}
          <span>{value}</span>
        </span>
      )
    }
  ];

  const actions = [
    {
      icon: CheckCircle,
      label: 'Approuver',
      onClick: (row: any) => console.log('Approve', row),
      color: 'text-green-600'
    },
    {
      icon: XCircle,
      label: 'Refuser',
      onClick: (row: any) => console.log('Reject', row),
      color: 'text-red-600'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { title: 'En attente', value: '8', color: 'bg-yellow-500', icon: Clock },
          { title: 'Approuvés', value: '15', color: 'bg-green-500', icon: CheckCircle },
          { title: 'Refusés', value: '2', color: 'bg-red-500', icon: XCircle },
          { title: 'Ce mois', value: '25', color: 'bg-blue-500', icon: Calendar }
        ].map((stat, index) => (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                <p className="text-sm text-gray-500">{stat.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">Demandes de Congé</h3>
              <p className="text-sm text-gray-500">Gérez les demandes de congé de vos employés</p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Nouvelle Demande</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            data={leaves}
            columns={columns}
            actions={actions}
            emptyMessage="Aucune demande de congé"
          />
        </div>
      </div>

      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Nouvelle Demande de Congé"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Employé
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Pierre Martin</option>
                <option>Marie Dubois</option>
                <option>Julie Moreau</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de congé
              </label>
              <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option>Congés payés</option>
                <option>Congé maladie</option>
                <option>Congé sans solde</option>
                <option>Congé maternité/paternité</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de début
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date de fin
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motif
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Décrivez le motif de la demande..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={() => setShowAddModal(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Enregistrer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};