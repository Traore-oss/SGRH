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
        labels: { usePointStyle: true, padding: 20, font: { size: 12 }, color: "#1E40AF" },
      },
    },
  };

  const getButtonClasses = (statut: string, action: "approve" | "reject" | "info") => {
    const base = "px-3 py-1 rounded-md text-xs sm:text-sm font-medium transition-colors duration-200";
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-4 px-4 sm:py-6 sm:px-6 lg:py-8 lg:px-8 transition-all duration-300 animate-fadeIn">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300">
          <h1 className="text-3xl font-bold text-blue-700 bg-gradient-to-r from-blue-400 to-blue-800 bg-clip-text text-transparent">
            Gestion des Congés
          </h1>
          <p className="text-gray-600 mt-3 md:mt-0">Gérez les demandes de congé de vos employés</p>
        </div>

        {/* Notifications flottantes */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 max-w-sm w-full sm:w-96 shadow-lg rounded-lg p-5 flex items-start space-x-4 animate-slideInRight ${
              notification.type === "success" ? "bg-green-500 text-white" : "bg-red-300 text-red-900"
            }`}
          >
            <div>
              {notification.type === "success" ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{notification.message}</p>
              {notification.demandeId && (
                <p className="text-xs opacity-90 mt-1">Réf: {notification.demandeId.slice(-6)}</p>
              )}
            </div>
            <button onClick={() => setNotification(null)} className="text-current hover:opacity-70 focus:outline-none">
              &times;
            </button>
          </div>
        )}

        {/* Notifications employés */}
        <div className="fixed bottom-4 right-4 z-40 space-y-3">
          {employeeNotifications.map((notif, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg shadow-lg flex items-start space-x-3 transform transition-all duration-500 ${
                notif.type === "success" ? "bg-green-600 border-l-4 border-green-800 text-white" : "bg-red-300 border-l-4 border-red-700 text-red-900"
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex-shrink-0 pt-0.5">
                {notif.type === "success" ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">Notification envoyée</p>
                <p className="mt-1 text-xs opacity-90">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bouton mobile affichage congés */}
        <div className="mb-5 flex justify-center sm:hidden">
          <button
            onClick={() => setShowConges(!showConges)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-5 rounded-lg flex items-center transition-colors duration-300"
          >
            {showConges ? "Masquer les congés" : "Voir les congés"}
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d={showConges ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"} />
            </svg>
          </button>
        </div>

        {/* Contenu principal */}
        <div className={`${showConges ? "block" : "hidden"} sm:block`}>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
            <StatCard title="En attente" count={demandesEnAttente.length} status="pending" />
            <StatCard title="Approuvés" count={demandesApprouvees.length} status="approved" />
            <StatCard title="Rejetés" count={demandesRejetees.length} status="rejected" />
          </div>

          {/* Pie Chart */}
          <div className="bg-white p-6 rounded-xl shadow-md border border-blue-200 mb-8 h-72">
            <h3 className="text-xl font-semibold text-blue-700 mb-4 text-center">Répartition des demandes de congé</h3>
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
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        .animate-slideInRight {
          animation: slideInRight 0.5s ease-out;
        }
        tr {
          animation: fadeIn 0.5s ease-out both;
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
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
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      )
    }
  };

  const config = statusConfig[status];

  return (
    <div className={`bg-white rounded-xl shadow-md p-5 border border-blue-200 hover:shadow-lg hover:scale-105 transition-transform duration-300`}>
      <div className="flex items-center space-x-4">
        <div className={`rounded-full ${config.iconBg} p-3`}>
          {config.iconSvg}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-600">{title}</p>
          <p className={`text-3xl font-bold ${config.text}`}>{count}</p>
        </div>
      </div>
    </div>
  );
};

const DemandesTable: React.FC<any> = ({ demandes, getEmploye, getStatut, handleApprove, handleReject, showDetails, getButtonClasses }) => {
  return (
    <div className="overflow-x-auto bg-white rounded-xl shadow-md p-5 border border-blue-200">
      <h3 className="text-lg font-semibold text-blue-700 mb-4">Liste des demandes de congé</h3>
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
              return (
                <tr key={d._id} className="hover:bg-blue-50 transition-colors duration-200 cursor-pointer" style={{ animationDelay: "0.05s" }}>
                  <td className="p-3 text-sm font-medium text-gray-900 whitespace-nowrap">
                    {employe ? `${employe.nom} ${employe.prenom}` : "Employé inconnu"}
                    <div className="text-xs text-gray-600 mt-1">Matricule: {employe ? employe.matricule : "N/A"}</div>
                    <div className="text-xs text-gray-600">{employe?.departement?.nom || "Non assigné"}</div>
                  </td>
                  <td className="p-3 text-sm text-gray-900 whitespace-nowrap">
                    {new Date(d.dateDebut).toLocaleDateString("fr-FR")} - {new Date(d.dateFin).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="p-3 text-sm text-gray-900 whitespace-nowrap">{d.typeConge}</td>
                  <td className="p-3 text-sm text-gray-900 whitespace-nowrap">{d.nbJours} jour(s)</td>
                  <td className="p-3 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 inline-flex text-xs font-semibold rounded-full ${
                        statut === "En attente" ? "bg-yellow-200 text-yellow-900" : statut === "Approuvé" ? "bg-green-200 text-green-900" : "bg-red-200 text-red-900"
                      }`}
                    >
                      {statut}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-gray-900 whitespace-nowrap">
                    <div className="flex flex-col sm:flex-row sm:space-x-2 space-y-1 sm:space-y-0">
                      <button
                        onClick={() => showDetails(d)}
                        className={getButtonClasses(statut, "info")}
                      >
                        Voir info
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
  );
};

const DemandeModal: React.FC<any> = ({ demande, getEmploye, getStatut, handleApprove, handleReject, onClose, getButtonClasses }) => {
  const employe = getEmploye(demande);
  const statut = getStatut(demande);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Détails de la demande</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl font-bold leading-none">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-4">
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
                <div><strong className="text-gray-700">Commentaire :</strong></div>
                <div className="text-gray-900">{demande.commentaireResponsable}</div>
              </>
            )}
          </div>
        </div>
        {statut === "En attente" && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => { handleApprove(demande); onClose(); }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Valider
            </button>
            <button
              onClick={() => { handleReject(demande); onClose(); }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              Refuser
            </button>
          </div>
        )}
      </div>
    </div>
  );
};