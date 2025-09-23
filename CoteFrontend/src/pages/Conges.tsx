/* eslint-disable @typescript-eslint/no-explicit-any */
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { approuverConge, refuserConge, getDemandesConge, getEmployees } from "../Components/CongesService";
import { useEffect, useState } from "react";
ChartJS.register(ArcElement, Tooltip, Legend);

interface Employee {
  _id: string;
  nom: string;
  prenom: string;
  matricule: string;
  email: string;
  departement?: {
    _id: string;
    nom: string;
  };
}

interface DemandeConge {
  _id: string;
  employe: string | Employee;
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  nbJours: number;
  motif?: string;
  etat: string;
  commentaireResponsable?: string;
  dateSoumission: string;
  dateValidation?: string;
}

export const CongesManager: React.FC = () => {
  const [demandes, setDemandes] = useState<DemandeConge[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedDemande, setSelectedDemande] = useState<DemandeConge | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState<{ type: string; message: string; demandeId?: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showConges, setShowConges] = useState(false);
  const [employeeNotifications, setEmployeeNotifications] = useState<{employeeId: string, message: string, type: string}[]>([]);

  const showNotification = (type: string, message: string, demandeId?: string) => {
    setNotification({ type, message, demandeId });
    setTimeout(() => setNotification(null), 3000);
  };

  const showEmployeeNotification = (employeeId: string, message: string, type: string) => {
    const newNotification = { employeeId, message, type };
    setEmployeeNotifications(prev => [...prev, newNotification]);
    setTimeout(() => {
      setEmployeeNotifications(prev => prev.filter(notif =>
        notif.employeeId !== employeeId || notif.message !== message
      ));
    }, 5000);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const employeesData = await getEmployees();
        setEmployees(employeesData);
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

  const getStatut = (demande: DemandeConge): string => {
    if (demande.etat === "approuvé") return "Approuvé";
    if (demande.etat === "refusé") return "Rejeté";
    return "En attente";
  };

  const getEmploye = (demande: DemandeConge): Employee | null => {
    if (typeof demande.employe === "object") return demande.employe as Employee;
    const emp = employees.find((e) => e._id === demande.employe);
    if (!emp) console.warn(`Employé non trouvé pour la demande ${demande._id}`);
    return emp || null;
  };

  const handleApprove = async (demande: DemandeConge) => {
    const result = await approuverConge(demande._id);
    if (result.success) {
      setDemandes((prev) =>
        prev.map((d) => (d._id === demande._id ? { ...d, etat: "approuvé" } : d))
      );
      showNotification("success", "Congé approuvé avec succès", demande._id);
      sendNotificationToEmployee(demande, "Approuvé");
    } else {
      showNotification("error", result.message);
    }
  };

  const handleReject = async (demande: DemandeConge) => {
    const result = await refuserConge(demande._id);
    if (result.success) {
      setDemandes((prev) =>
        prev.map((d) => (d._id === demande._id ? { ...d, etat: "refusé" } : d))
      );
      showNotification("success", "Congé rejeté avec succès", demande._id);
      sendNotificationToEmployee(demande, "Rejeté");
    } else {
      showNotification("error", result.message);
    }
  };

  const sendNotificationToEmployee = (demande: DemandeConge, statut: string) => {
    const employee = getEmploye(demande);
    if (employee) {
      const message = `Votre demande de congé du ${new Date(demande.dateDebut).toLocaleDateString("fr-FR")} au ${new Date(demande.dateFin).toLocaleDateString("fr-FR")} a été ${statut.toLowerCase()}.`;
      showEmployeeNotification(
        employee._id,
        message,
        statut === "Approuvé" ? "success" : "error"
      );
      console.log(`Email à ${employee.email}: ${message}`);
    }
  };

  const showDetails = (demande: DemandeConge) => {
    setSelectedDemande(demande);
    setShowModal(true);
  };

  const demandesEnAttente = demandes.filter((d) => getStatut(d) === "En attente");
  const demandesApprouvees = demandes.filter((d) => getStatut(d) === "Approuvé");
  const demandesRejetees = demandes.filter((d) => getStatut(d) === "Rejeté");

  const pieData = {
    labels: ["En attente", "Approuvés", "Rejetés"],
    datasets: [
      {
        data: [demandesEnAttente.length, demandesApprouvees.length, demandesRejetees.length],
        backgroundColor: ["#FBBF24", "#34D399", "#EF4444"],
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { 
          usePointStyle: true, 
          padding: 20, 
          font: { 
            size: typeof window !== 'undefined' && window.innerWidth < 640 ? 10 : 12 
          }, 
          color: "#1E40AF" 
        },
      },
    },
  };

  const getButtonClasses = (statut: string, action: "approve" | "reject" | "info") => {
    const base = "px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs font-medium transition-colors duration-200 flex-1 sm:flex-none";
    if (statut === "En attente") {
      if (action === "approve") return `${base} bg-green-600 text-white hover:bg-green-700`;
      if (action === "reject") return `${base} bg-red-600 text-white hover:bg-red-700`;
    }
    if (statut === "Approuvé") {
      if (action === "info") return `${base} bg-gray-700 text-white hover:bg-gray-800`;
    }
    if (statut === "Rejeté") {
      if (action === "info") return `${base} bg-gray-600 text-white hover:bg-gray-700`;
    }
    return base;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-2 px-2 sm:py-4 sm:px-4 lg:py-6 lg:px-6 xl:py-8 xl:px-8 transition-all duration-300 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 p-3 sm:p-4 md:p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-blue-700 bg-gradient-to-r from-blue-400 to-blue-800 bg-clip-text text-transparent text-center md:text-left mb-2 md:mb-0">
            Gestion des Congés
          </h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg text-center md:text-right max-w-md">
            Gérez les demandes de congé de vos employés
          </p>
        </div>

        {/* Notifications flottantes */}
        {notification && (
          <div
            className={`fixed top-2 left-2 right-2 sm:left-auto sm:right-4 sm:top-4 z-50 max-w-full sm:max-w-sm w-full shadow-lg rounded-lg p-3 sm:p-4 flex items-start space-x-3 animate-slideInRight ${
              notification.type === "success" ? "bg-green-500 text-white" : "bg-red-300 text-red-900"
            }`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {notification.type === "success" ? (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm sm:text-base truncate">{notification.message}</p>
              {notification.demandeId && (
                <p className="text-xs opacity-90 mt-1">Réf: {notification.demandeId.slice(-6)}</p>
              )}
            </div>
            <button 
              onClick={() => setNotification(null)} 
              className="flex-shrink-0 text-current hover:opacity-70 focus:outline-none text-lg font-bold"
            >
              &times;
            </button>
          </div>
        )}

        {/* Notifications employés */}
        <div className="fixed bottom-2 left-2 right-2 sm:left-auto sm:right-4 sm:bottom-4 z-40 space-y-2 max-w-full sm:max-w-sm">
          {employeeNotifications.map((notif, index) => (
            <div
              key={index}
              className={`p-3 rounded-lg shadow-lg flex items-start space-x-3 transform transition-all duration-500 ${
                notif.type === "success" ? "bg-green-600 border-l-4 border-green-800 text-white" : "bg-red-300 border-l-4 border-red-700 text-red-900"
              }`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {notif.type === "success" ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">Notification envoyée</p>
                <p className="mt-1 text-xs opacity-90 line-clamp-2">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton mobile affichage congés */}
        <div className="mb-4 flex justify-center sm:hidden">
          <button
            onClick={() => setShowConges(!showConges)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 text-sm w-full max-w-xs justify-center"
          >
            {showConges ? "Masquer les congés" : "Voir les congés"}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d={showConges ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        )}

        {/* Contenu principal */}
        {!isLoading && (
          <div className={`${showConges ? "block" : "hidden"} sm:block animate-fadeIn`}>
            {/* Stat Cards */}
            <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
              <StatCard title="En attente" count={demandesEnAttente.length} status="pending" />
              <StatCard title="Approuvés" count={demandesApprouvees.length} status="approved" />
              <StatCard title="Rejetés" count={demandesRejetees.length} status="rejected" />
            </div>

            {/* Pie Chart */}
            <div className="bg-white p-3 sm:p-4 lg:p-6 rounded-xl shadow-md border border-blue-200 mb-6 h-64 sm:h-72 lg:h-80">
              <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-700 mb-3 sm:mb-4 text-center">
                Répartition des demandes de congé
              </h3>
              <Pie data={pieData} options={pieOptions} />
            </div>

            {/* Tableau des demandes */}
            <DemandesTable
              demandes={demandes}
              getEmploye={getEmploye}
              getStatut={getStatut}
              handleApprove={handleApprove}
              handleReject={handleReject}
              showDetails={showDetails}
              getButtonClasses={getButtonClasses}
            />
          </div>
        )}

        {/* Modal details */}
        {showModal && selectedDemande && (
          <DemandeModal
            demande={selectedDemande}
            getEmploye={getEmploye}
            getStatut={getStatut}
            handleApprove={handleApprove}
            handleReject={handleReject}
            onClose={() => setShowModal(false)}
            getButtonClasses={getButtonClasses}
          />
        )}
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Responsive table styles */
        @media (max-width: 640px) {
          .table-responsive {
            display: block;
            width: 100%;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
};

interface StatCardProps {
  title: string;
  count: number;
  status: "pending" | "approved" | "rejected";
}

const StatCard: React.FC<StatCardProps> = ({ title, count, status }) => {
  const statusConfig = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: "text-yellow-600",
      iconBg: "bg-yellow-200",
      iconSvg: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    approved: {
      bg: "bg-green-100",
      text: "text-green-800",
      icon: "text-green-600",
      iconBg: "bg-green-200",
      iconSvg: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-800",
      icon: "text-red-600",
      iconBg: "bg-red-200",
      iconSvg: (
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`bg-white rounded-xl shadow-md p-3 sm:p-4 border border-blue-200 hover:shadow-lg transition-all duration-300 transform hover:scale-105`}>
      <div className="flex items-center space-x-3">
        <div className={`rounded-full ${config.iconBg} p-2`}>
          {config.iconSvg}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-semibold text-gray-600 truncate">{title}</p>
          <p className={`text-2xl sm:text-3xl font-bold ${config.text}`}>{count}</p>
        </div>
      </div>
    </div>
  );
};

const DemandesTable: React.FC<any> = ({ demandes, getEmploye, getStatut, handleApprove, handleReject, showDetails, getButtonClasses }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-3 sm:p-4 lg:p-5 border border-blue-200">
      <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-blue-700 mb-3 sm:mb-4">
        Liste des demandes de congé
      </h3>
      
      {/* Mobile Cards View */}
      <div className="sm:hidden space-y-3">
        {demandes.length > 0 ? (
          demandes.map((d: DemandeConge) => {
            const statut = getStatut(d);
            const employe = getEmploye(d);
            const duree = Math.floor(
              (new Date(d.dateFin).getTime() - new Date(d.dateDebut).getTime()) / (1000 * 60 * 60 * 24) + 1
            );

            return (
              <div key={d._id} className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold text-sm">
                        {employe ? `${employe.nom} ${employe.prenom}` : "Employé inconnu"}
                      </p>
                      <p className="text-xs text-gray-600">Matricule: {employe ? employe.matricule : "N/A"}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      statut === "En attente" ? "bg-yellow-200 text-yellow-900" : 
                      statut === "Approuvé" ? "bg-green-200 text-green-900" : 
                      "bg-red-200 text-red-900"
                    }`}>
                      {statut}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="font-medium">Période:</span>
                      <p>{new Date(d.dateDebut).toLocaleDateString("fr-FR")} - {new Date(d.dateFin).toLocaleDateString("fr-FR")}</p>
                    </div>
                    <div>
                      <span className="font-medium">Durée:</span>
                      <p>{duree} jour(s)</p>
                    </div>
                    <div>
                      <span className="font-medium">Type:</span>
                      <p>{d.typeConge}</p>
                    </div>
                    <div>
                      <span className="font-medium">Département:</span>
                      <p>{employe?.departement?.nom || "Non assigné"}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <button 
                      onClick={() => showDetails(d)} 
                      className={getButtonClasses(statut, "info")}
                    >
                      Détails
                    </button>
                    {statut === "En attente" && (
                      <>
                        <button 
                          onClick={() => handleApprove(d)} 
                          className={getButtonClasses(statut, "approve")}
                        >
                          Valider
                        </button>
                        <button 
                          onClick={() => handleReject(d)} 
                          className={getButtonClasses(statut, "reject")}
                        >
                          Refuser
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-gray-500 text-sm">
            Aucune demande de congé
          </div>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden sm:block overflow-x-auto table-responsive">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-blue-100 rounded-lg">
              <th className="p-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide rounded-tl-lg">Employé</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Période</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Type</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Durée</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide">Statut</th>
              <th className="p-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wide rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-200">
            {demandes.length > 0 ? (
              demandes.map((d: DemandeConge) => {
                const statut = getStatut(d);
                const employe = getEmploye(d);
                const duree = Math.floor(
                  (new Date(d.dateFin).getTime() - new Date(d.dateDebut).getTime()) / (1000 * 60 * 60 * 24) + 1
                );

                return (
                  <tr key={d._id} className="hover:bg-blue-50 transition-colors duration-200">
                    <td className="p-3 text-sm font-medium text-gray-900">
                      <div>{employe ? `${employe.nom} ${employe.prenom}` : "Employé inconnu"}</div>
                      <div className="text-xs text-gray-600 mt-1">Matricule: {employe ? employe.matricule : "N/A"}</div>
                      <div className="text-xs text-gray-600">{employe?.departement?.nom || "Non assigné"}</div>
                    </td>
                    <td className="p-3 text-sm text-gray-900">
                      {new Date(d.dateDebut).toLocaleDateString("fr-FR")} - {new Date(d.dateFin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="p-3 text-sm text-gray-900">{d.typeConge}</td>
                    <td className="p-3 text-sm text-gray-900">{duree} jour(s)</td>
                    <td className="p-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                        statut === "En attente" ? "bg-yellow-200 text-yellow-900" : 
                        statut === "Approuvé" ? "bg-green-200 text-green-900" : 
                        "bg-red-200 text-red-900"
                      }`}>
                        {statut}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-col lg:flex-row gap-2">
                        <button onClick={() => showDetails(d)} className={getButtonClasses(statut, "info")}>
                          Détails
                        </button>
                        {statut === "En attente" && (
                          <>
                            <button onClick={() => handleApprove(d)} className={getButtonClasses(statut, "approve")}>
                              Valider
                            </button>
                            <button onClick={() => handleReject(d)} className={getButtonClasses(statut, "reject")}>
                              Refuser
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
                <td colSpan={6} className="p-6 text-center text-gray-500 text-sm">
                  Aucune demande de congé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const DemandeModal: React.FC<any> = ({ demande, getEmploye, getStatut, handleApprove, handleReject, onClose, getButtonClasses }) => {
  const employe = getEmploye(demande);
  const statut = getStatut(demande);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto mx-2 sm:mx-0">
        <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Détails de la demande</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none focus:outline-none"
          >
            &times;
          </button>
        </div>
        <div className="px-4 py-3 sm:px-6 sm:py-4 space-y-3 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div><strong className="text-gray-700">Employé :</strong></div>
            <div className="text-gray-900">{employe ? `${employe.nom} ${employe.prenom}` : "Inconnu"}</div>
            
            <div><strong className="text-gray-700">Matricule :</strong></div>
            <div className="text-gray-900">{employe?.matricule || "N/A"}</div>
            
            <div><strong className="text-gray-700">Département :</strong></div>
            <div className="text-gray-900">{employe?.departement?.nom || "Non assigné"}</div>
            
            <div><strong className="text-gray-700">Période :</strong></div>
            <div className="text-gray-900">{new Date(demande.dateDebut).toLocaleDateString("fr-FR")} - {new Date(demande.dateFin).toLocaleDateString("fr-FR")}</div>
            
            <div><strong className="text-gray-700">Type :</strong></div>
            <div className="text-gray-900">{demande.typeConge}</div>
            
            <div><strong className="text-gray-700">Durée :</strong></div>
            <div className="text-gray-900">{demande.nbJours} jour(s)</div>
            
            <div><strong className="text-gray-700">Motif :</strong></div>
            <div className="text-gray-900">{demande.motif || "N/A"}</div>
            
            <div><strong className="text-gray-700">Statut :</strong></div>
            <div className="text-gray-900">{statut}</div>
            
            <div><strong className="text-gray-700">Soumis le :</strong></div>
            <div className="text-gray-900">{new Date(demande.dateSoumission).toLocaleDateString("fr-FR")}</div>
            
            {demande.commentaireResponsable && (
              <>
                <div className="sm:col-span-2"><strong className="text-gray-700">Commentaire :</strong></div>
                <div className="sm:col-span-2 text-gray-900">{demande.commentaireResponsable}</div>
              </>
            )}
          </div>
        </div>
        {statut === "En attente" && (
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-t border-gray-200 flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end">
            <button
              onClick={() => { handleApprove(demande); onClose(); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
            >
              Valider
            </button>
            <button
              onClick={() => { handleReject(demande); onClose(); }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
            >
              Refuser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};