/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-refresh/only-export-components */
// import React, { useState, useEffect } from "react";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
} from "chart.js";
import { useEffect, useState } from "react";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Interface pour un département
export interface Departement {
  _id: string;
  nom: string;
}

// Interface pour un employé
export interface Employee {
  isActive: any;
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  departement?: Departement;
  salaire: string | number;
  typeContrat: 'CDI' | 'CDD';
  role: string;
  photo?: string;
}

// Interface pour une demande de congé
export interface DemandeConge {
  _id: string;
  employe: string | Employee;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  nbJours: number;
  motif: string;
  etat: boolean | null;
  commentaireResponsable: string;
  dateSoumission: string;
  dateValidation: string | null;
  isApproved?: boolean;
}

// Fonction pour récupérer tous les employés
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/Users/getAllEmployees`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erreur lors de la récupération des employés');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Fonction pour récupérer toutes les demandes de congé
export const getDemandesConge = async (): Promise<DemandeConge[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/conges/getAllConges`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erreur lors de la récupération des demandes de congé');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

// Fonction pour approuver un congé
export const approuverConge = async (id: string): Promise<{success: boolean, message: string}> => {
  try {
    const res = await fetch(`${API_BASE}/api/conges/approuverConge/${id}`, {
      method: 'PUT',
      credentials: 'include',
    });
    
    if (!res.ok) throw new Error('Erreur lors de l\'approbation du congé');
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Erreur lors de l'approbation du congé" };
  }
};

// Fonction pour refuser un congé
export const refuserConge = async (id: string): Promise<{success: boolean, message: string}> => {
  try {
    const res = await fetch(`${API_BASE}/api/conges/refuserConge/${id}`, {
      method: 'PUT',
      credentials: 'include',
    });
    
    if (!res.ok) throw new Error('Erreur lors du refus du congé');
    const data = await res.json();
    return { success: true, message: data.message };
  } catch (err) {
    console.error(err);
    return { success: false, message: "Erreur lors du refus du congé" };
  }
};

// Composant principal pour la gestion des congés
export const CongesManager: React.FC = () => {
  const [demandes, setDemandes] = useState<DemandeConge[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDemande, setSelectedDemande] = useState<DemandeConge | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Afficher une notification temporaire
  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupération des employés
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        
        // Récupération des demandes de congé
        const demandesData = await getDemandesConge();
        setDemandes(demandesData);
        
        setIsLoading(false);
        showNotification("success", "Données chargées avec succès");
      } catch (error) {
        setIsLoading(false);
        showNotification("error", "Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, []);

  // Fonction pour obtenir le statut d'une demande
  const getStatut = (demande: DemandeConge): string => {
    if (demande.etat === true || demande.isApproved === true) return "Approuvé";
    if (demande.etat === false || demande.isApproved === false) return "Rejeté";
    return "En attente";
  };

  // Fonction pour obtenir l'employé associé à une demande
  const getEmploye = (demande: DemandeConge): Employee | null => {
    if (typeof demande.employe === 'object') {
      return demande.employe as Employee;
    }
    
    const employe = employees.find(emp => emp._id === demande.employe);
    return employe || null;
  };

  // Fonction pour gérer l'approbation d'une demande
  const handleApprove = async (demande: DemandeConge) => {
    const result = await approuverConge(demande._id);
    
    if (result.success) {
      // Mettre à jour l'état local
      setDemandes(prev => prev.map(d => 
        d._id === demande._id ? { ...d, etat: true, isApproved: true } : d
      ));
      
      showNotification("success", "Congé approuvé avec succès");
      
      // Envoyer une notification à l'employé
      sendNotificationToEmployee(demande, "Approuvé");
    } else {
      showNotification("error", result.message);
    }
  };

  // Fonction pour gérer le rejet d'une demande
  const handleReject = async (demande: DemandeConge) => {
    const result = await refuserConge(demande._id);
    
    if (result.success) {
      // Mettre à jour l'état local
      setDemandes(prev => prev.map(d => 
        d._id === demande._id ? { ...d, etat: false, isApproved: false } : d
      ));
      
      showNotification("success", "Congé rejeté avec succès");
      
      // Envoyer une notification à l'employé
      sendNotificationToEmployee(demande, "Rejeté");
    } else {
      showNotification("error", result.message);
    }
  };

  // Fonction pour envoyer une notification à l'employé
  const sendNotificationToEmployee = (demande: DemandeConge, statut: string) => {
    // Trouver l'employé concerné
    const employee = getEmploye(demande);
    
    if (employee) {
      // Simuler l'envoi d'une notification sur le site web
      console.log(`Notification envoyée à ${employee.nom} ${employee.prenom}: Votre demande de congé a été ${statut.toLowerCase()}`);
      
      // Simuler l'envoi d'un email
      console.log(`Email envoyé à ${employee.email}: Votre demande de congé a été ${statut.toLowerCase()}`);
    }
  };

  // Fonction pour afficher les détails d'une demande
  const showDetails = (demande: DemandeConge) => {
    setSelectedDemande(demande);
    setShowModal(true);
  };

  // Filtrer les demandes par statut
  const demandesEnAttente = demandes.filter(d => getStatut(d) === "En attente");
  const demandesApprouvees = demandes.filter(d => getStatut(d) === "Approuvé");
  const demandesRejetees = demandes.filter(d => getStatut(d) === "Rejeté");

  // Données pour les graphiques
  const pieData = {
    labels: ["En attente", "Approuvés", "Rejetés"],
    datasets: [
      { 
        data: [demandesEnAttente.length, demandesApprouvees.length, demandesRejetees.length], 
        backgroundColor: ["#f59e0b", "#16a34a", "#dc2626"],
        borderWidth: 0,
        hoverOffset: 12
      }
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
        }
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestion des Congés</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Gérez les demandes de congé de vos employés
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-2 sm:right-4 z-50 p-3 sm:p-4 rounded-lg shadow-lg text-white text-sm sm:text-base ${
            notification.type === 'error' ? 'bg-red-500' : 
            notification.type === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Indicateur de chargement */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg flex items-center text-sm sm:text-base">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500 mr-2 sm:mr-3"></div>
              <span>Chargement des données...</span>
            </div>
          </div>
        )}

        {/* Cartes statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-yellow-100">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2 sm:p-3 mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">En attente</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{demandesEnAttente.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-green-100">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 sm:p-3 mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Approuvés</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{demandesApprouvees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-red-100">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-2 sm:p-3 mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Rejetés</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{demandesRejetees.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagramme circulaire */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">Répartition des demandes de congé</h3>
          <div className="h-60 sm:h-72 lg:h-80">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        {/* Tableau des demandes de congé */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Liste des demandes de congé</h3>
            <span className="text-xs sm:text-sm text-gray-500">{demandes.length} demande(s) au total</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {demandes.length > 0 ? (
                  demandes.map((d: DemandeConge) => {
                    const statut = getStatut(d);
                    const employe = getEmploye(d);
                    
                    return (
                      <tr key={d._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {employe ? `${employe.nom} ${employe.prenom}` : 'Employé inconnu'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {employe ? employe.matricule : 'N/A'}
                          </div>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(d.dateDebut).toLocaleDateString('fr-FR')} - {new Date(d.dateFin).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">{d.typeConge}</td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">{d.nbJours} jour(s)</td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full
                            ${statut === "En attente" ? "bg-yellow-100 text-yellow-800" : 
                              statut === "Approuvé" ? "bg-green-100 text-green-800" : 
                              "bg-red-100 text-red-800"}`}>
                            {statut}
                          </span>
                        </td>
                        <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex space-x-2">
                            {/* Bouton pour voir les détails */}
                            <button
                              onClick={() => showDetails(d)}
                              className="px-2 py-1 sm:px-3 sm:py-1 bg-blue-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-blue-700"
                            >
                              Détails
                            </button>
                            
                            {/* Boutons d'action conditionnels */}
                            {statut === "En attente" ? (
                              <>
                                <button
                                  onClick={() => handleApprove(d)}
                                  className="px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-green-700"
                                >
                                  Valider
                                </button>
                                <button
                                  onClick={() => handleReject(d)}
                                  className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-red-700"
                                >
                                  Refuser
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => showDetails(d)}
                                  className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-gray-700"
                                >
                                  Voir info
                                </button>
                                <button
                                  className="px-2 py-1 sm:px-3 sm:py-1 bg-purple-600 text-white rounded-md text-xs sm:text-sm font-medium"
                                  disabled
                                >
                                  {statut}
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 sm:px-6 sm:py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm sm:text-base font-medium">Aucune demande de congé</p>
                        <p className="mt-1 text-xs sm:text-sm">Aucune demande n'a été trouvée</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de détails */}
        {showModal && selectedDemande && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Détails de la demande</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4">
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Employé</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    {getEmploye(selectedDemande) ? 
                      `${getEmploye(selectedDemande)?.nom} ${getEmploye(selectedDemande)?.prenom} (${getEmploye(selectedDemande)?.matricule})` : 
                      'Employé inconnu'}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Période</h4>
                  <p className="mt-1 text-sm text-gray-900">
                    Du {new Date(selectedDemande.dateDebut).toLocaleDateString('fr-FR')} au {new Date(selectedDemande.dateFin).toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Type de congé</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedDemande.typeConge}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Durée</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedDemande.nbJours} jour(s)</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Motif</h4>
                  <p className="mt-1 text-sm text-gray-900">{selectedDemande.motif || 'Non spécifié'}</p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                  <p className="mt-1">
                    <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full
                      ${getStatut(selectedDemande) === "En attente" ? "bg-yellow-100 text-yellow-800" : 
                        getStatut(selectedDemande) === "Approuvé" ? "bg-green-100 text-green-800" : 
                        "bg-red-100 text-red-800"}`}>
                      {getStatut(selectedDemande)}
                    </span>
                  </p>
                </div>
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500">Date de la demande</h4>
                  <p className="mt-1 text-sm text-gray-900">{new Date(selectedDemande.dateSoumission).toLocaleDateString('fr-FR')}</p>
                </div>
                {selectedDemande.commentaireResponsable && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-500">Commentaire du responsable</h4>
                    <p className="mt-1 text-sm text-gray-900">{selectedDemande.commentaireResponsable}</p>
                  </div>
                )}
              </div>
              <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Fermer
                </button>
                {getStatut(selectedDemande) === "En attente" && (
                  <>
                    <button
                      onClick={() => {
                        handleApprove(selectedDemande);
                        setShowModal(false);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                    >
                      Valider
                    </button>
                    <button
                      onClick={() => {
                        handleReject(selectedDemande);
                        setShowModal(false);
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    >
                      Refuser
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};