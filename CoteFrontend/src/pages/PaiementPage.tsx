/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getPaiements, deletePaiement } from "../Components/paiementService";
import PaiementForm from "../forms/PaiementForm";

interface Employe {
  _id: string;
  nom: string;
  prenom: string;
  employer: {
    matricule: string;
  };
}

interface Paiement {
  _id: string;
  employe: Employe;
  mois: string;
  salaireNet: number;
  modePaiement: string;
}

const Paiements: React.FC = () => {
  const [paiements, setPaiements] = useState<Paiement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPaiement, setSelectedPaiement] = useState<Paiement | undefined>();
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchPaiements = async () => {
    try {
      setLoading(true);
      const data = await getPaiements();
      setPaiements(data);
      setError(null);
    } catch (err: any) {
      const errorMessage = err.message || "Erreur lors du chargement des paiements";
      setError(errorMessage);
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaiements();
  }, []);

  const handleDelete = async (id: string) => {
    if (isDeleting) return;
    
    toast.info(
      <div className="animate-fade-in">
        <p className="font-semibold text-gray-800 mb-2">Confirmer la suppression</p>
        <p className="text-sm text-gray-600">Voulez-vous vraiment supprimer ce paiement ?</p>
        <div className="flex justify-end space-x-2 mt-4">
          <button
            className="px-3 py-2 text-xs sm:text-sm bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors duration-200 transform hover:scale-105"
            onClick={() => toast.dismiss()}
          >
            Annuler
          </button>
          <button
            className="px-3 py-2 text-xs sm:text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={async () => {
              setIsDeleting(id);
              toast.dismiss();
              try {
                await deletePaiement(id);
                setPaiements(prev => prev.filter(p => p._id !== id));
                toast.success("Paiement supprimé avec succès", {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                  icon: "✅"
                });
              } catch (err: any) {
                toast.error(err.message || "Erreur lors de la suppression", {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: true,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                });
              } finally {
                setIsDeleting(null);
              }
            }}
            disabled={isDeleting === id}
          >
            {isDeleting === id ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-3 w-3 sm:h-4 sm:w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression...
              </span>
            ) : (
              "Confirmer"
            )}
          </button>
        </div>
      </div>,
      {
        position: window.innerWidth < 640 ? "bottom-center" : "top-center",
        autoClose: false,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        progress: undefined,
        theme: "light",
      }
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen animate-fade-in">
      <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-blue-600"></div>
    </div>
  );
  
  if (error) return (
    <div className="p-2 sm:p-4 animate-fade-in">
      <div className="bg-red-50 border-l-4 border-red-500 p-3 sm:p-4 rounded-lg shadow-sm animate-shake">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-xs sm:text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-3 md:p-4 lg:p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 animate-slide-down">
              Gestion des Paiements
            </h1>
            <p className="text-gray-600 mt-1 text-xs sm:text-sm">Gérez les paiements de vos employés</p>
          </div>
          
          {(user.role === "Admin" || user.role === "RH") && (
            <button
              className="w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:translate-y-0 animate-bounce-in text-sm sm:text-base"
              onClick={() => {
                setSelectedPaiement(undefined);
                setModalOpen(true);
              }}
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Nouveau Paiement
            </button>
          )}
        </div>

        {/* Mobile Cards View */}
        <div className="block lg:hidden space-y-3 sm:space-y-4 animate-scale-in">
          {paiements.length === 0 ? (
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-6 sm:p-8 text-center">
              <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
              </svg>
              <p className="text-sm sm:text-lg font-medium text-gray-400">Aucun paiement enregistré</p>
              <p className="text-xs sm:text-sm text-gray-300 mt-1">Commencez par ajouter un nouveau paiement</p>
            </div>
          ) : (
            paiements.map((p, index) => (
              <div 
                key={p._id}
                className="bg-white rounded-xl sm:rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:p-4 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-blue-800 font-medium text-xs sm:text-sm">
                        {p.employe.nom.charAt(0)}{p.employe.prenom.charAt(0)}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">
                        {p.employe.nom} {p.employe.prenom}
                      </div>
                      <div className="text-xs text-gray-500">{p.employe.employer.matricule}</div>
                    </div>
                  </div>
                  <div className="flex space-x-1 sm:space-x-2">
                    <button
                      className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      onClick={() => {
                        setSelectedPaiement(p);
                        setModalOpen(true);
                      }}
                      title="Modifier"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    {(user.role === "Admin" || user.role === "RH") && (
                      <button
                        className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        onClick={() => handleDelete(p._id)}
                        title="Supprimer"
                        disabled={isDeleting === p._id}
                      >
                        {isDeleting === p._id ? (
                          <svg className="animate-spin w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div>
                    <span className="text-gray-500">Mois:</span>
                    <div className="font-medium text-gray-900 truncate">
                      {new Date(p.mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">Salaire Net:</span>
                    <div className="font-bold text-green-600 truncate">
                      {p.salaireNet.toLocaleString('fr-FR')} GNF
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Mode de paiement:</span>
                    <span className="ml-1 sm:ml-2 px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                      {p.modePaiement}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Tablet and Desktop Table View */}
        <div className="hidden lg:block bg-white rounded-xl sm:rounded-2xl shadow-sm overflow-hidden animate-scale-in">
          <div className="overflow-x-auto">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Employé
                  </th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Mois
                  </th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Salaire Net
                  </th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Mode Paiement
                  </th>
                  <th className="px-4 py-3 sm:px-6 sm:py-4 text-left text-xs sm:text-sm font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paiements.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 sm:py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                        <p className="text-sm sm:text-lg font-medium text-gray-400">Aucun paiement enregistré</p>
                        <p className="text-xs sm:text-sm text-gray-300 mt-1">Commencez par ajouter un nouveau paiement</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  paiements.map((p, index) => (
                    <tr 
                      key={p._id} 
                      className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-blue-800 font-medium text-xs sm:text-sm">
                              {p.employe.nom.charAt(0)}{p.employe.prenom.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-3">
                            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-none">
                              {p.employe.nom} {p.employe.prenom}
                            </div>
                            <div className="text-xs text-gray-500">{p.employe.employer.matricule}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="text-xs sm:text-sm text-gray-900 font-medium">
                          {new Date(p.mois).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="text-xs sm:text-sm font-bold text-green-600">
                          {p.salaireNet.toLocaleString('fr-FR')} GNF
                        </div>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <span className="px-2 py-1 inline-flex text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                          {p.modePaiement}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4">
                        <div className="flex space-x-1 sm:space-x-2">
                          <button
                            className="p-1 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            onClick={() => {
                              setSelectedPaiement(p);
                              setModalOpen(true);
                            }}
                            title="Modifier"
                          >
                            <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                          </button>
                          {(user.role === "Admin" || user.role === "RH") && (
                            <button
                              className="p-1 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                              onClick={() => handleDelete(p._id)}
                              title="Supprimer"
                              disabled={isDeleting === p._id}
                            >
                              {isDeleting === p._id ? (
                                <svg className="animate-spin w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                              ) : (
                                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                </svg>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalOpen && (
        <div className="animate-modal-fade-in">
          <PaiementForm
            paiement={selectedPaiement}
            onClose={() => setModalOpen(false)}
            onSaved={() => {
              fetchPaiements();
              toast.success(selectedPaiement ? "Paiement modifié avec succès" : "Paiement créé avec succès", {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                icon: "✅"
              });
            }}
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideDown {
          from { transform: translateY(-20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes fadeInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); }
          70% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: scale(0.8) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        
        .animate-fade-in { animation: fadeIn 0.6s ease-out; }
        .animate-slide-down { animation: slideDown 0.5s ease-out; }
        .animate-scale-in { animation: scaleIn 0.4s ease-out; }
        .animate-fade-in-up { animation: fadeInUp 0.5s ease-out forwards; }
        .animate-bounce-in { animation: bounceIn 0.6s ease-out; }
        .animate-shake { animation: shake 0.5s ease-in-out; }
        .animate-modal-fade-in { animation: modalFadeIn 0.3s ease-out; }
        
        /* Responsive text truncation */
        .truncate {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
};

export default Paiements;