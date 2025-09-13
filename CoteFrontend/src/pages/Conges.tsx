/* eslint-disable @typescript-eslint/no-explicit-any */
// import React, { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { approuverConge, refuserConge, getDemandesConge, getEmployees } from "../Components/CongesService";
import { useEffect, useState } from "react";
ChartJS.register(ArcElement, Tooltip, Legend);

// Types
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
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
      showNotification("success", "Congé approuvé avec succès");
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
      showNotification("success", "Congé rejeté avec succès");
      sendNotificationToEmployee(demande, "Rejeté");
    } else {
      showNotification("error", result.message);
    }
  };

  const sendNotificationToEmployee = (demande: DemandeConge, statut: string) => {
    const employee = getEmploye(demande);
    if (employee) {
      console.log(`Notification à ${employee.nom} ${employee.prenom}: Votre congé est ${statut.toLowerCase()}`);
      console.log(`Email à ${employee.email}: Votre congé est ${statut.toLowerCase()}`);
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
        backgroundColor: ["#f59e0b", "#16a34a", "#dc2626"],
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
        labels: { usePointStyle: true, padding: 20, font: { size: 12 } },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestion des Congés</h1>
          <p className="text-sm sm:text-base text-gray-600">Gérez les demandes de congé de vos employés</p>
        </div>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-2 sm:right-4 z-50 p-3 sm:p-4 rounded-lg shadow-lg text-white text-sm sm:text-base ${
              notification.type === "error" ? "bg-red-500" : notification.type === "warning" ? "bg-yellow-500" : "bg-green-500"
            }`}
          >
            {notification.message}
          </div>
        )}

        {/* Loader */}
        {isLoading && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg flex items-center text-sm sm:text-base">
              <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-blue-500 mr-2 sm:mr-3"></div>
              <span>Chargement des données...</span>
            </div>
          </div>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
          <StatCard title="En attente" count={demandesEnAttente.length} color="yellow" />
          <StatCard title="Approuvés" count={demandesApprouvees.length} color="green" />
          <StatCard title="Rejetés" count={demandesRejetees.length} color="red" />
        </div>

        {/* Pie Chart */}
        <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100 mb-6 sm:mb-8">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">
            Répartition des demandes de congé
          </h3>
          <div className="h-60 sm:h-72 lg:h-80">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>

        {/* Table */}
        <DemandesTable
          demandes={demandes}
          getEmploye={getEmploye}
          getStatut={getStatut}
          handleApprove={handleApprove}
          handleReject={handleReject}
          showDetails={showDetails}
        />

        {/* Modal */}
        {showModal && selectedDemande && (
          <DemandeModal
            demande={selectedDemande}
            getEmploye={getEmploye}
            getStatut={getStatut}
            handleApprove={handleApprove}
            handleReject={handleReject}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  );
};

// Composants auxiliaires
const StatCard: React.FC<{ title: string; count: number; color: "yellow" | "green" | "red" }> = ({ title, count, color }) => {
  const colors = {
    yellow: { bg: "bg-yellow-100", text: "text-yellow-800", icon: "text-yellow-600" },
    green: { bg: "bg-green-100", text: "text-green-800", icon: "text-green-600" },
    red: { bg: "bg-red-100", text: "text-red-800", icon: "text-red-600" },
  };
  return (
    <div className={`bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-${color}-100`}>
      <div className="flex items-center">
        <div className={`rounded-full ${colors[color].bg} p-2 sm:p-3 mr-3 sm:mr-4`}>
          <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${colors[color].icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {color === "yellow" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
            {color === "green" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>}
            {color === "red" && <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>}
          </svg>
        </div>
        <div>
          <p className="text-xs sm:text-sm font-medium text-gray-500">{title}</p>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{count}</p>
        </div>
      </div>
    </div>
  );
};

// Tableau des demandes
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DemandesTable: React.FC<any> = ({ demandes, getEmploye, getStatut, handleApprove, handleReject, showDetails }) => {
  return (
    <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden border border-gray-100">
      <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Liste des demandes de congé</h3>
        <span className="text-xs sm:text-sm text-gray-500">{demandes.length} demande(s) au total</span>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Période</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durée</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
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
                      <div className="text-sm font-medium text-gray-900">{employe ? `${employe.nom} ${employe.prenom}` : "Employé inconnu"}</div>
                      <div className="text-xs text-gray-500 mt-1">Matricule: {employe ? employe.matricule : "N/A"}</div>
                      <div className="text-xs text-gray-500">Département: {employe?.departement?.nom || "Non assigné"}</div>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(d.dateDebut).toLocaleDateString("fr-FR")} - {new Date(d.dateFin).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">{d.typeConge}</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">{d.nbJours} jour(s)</td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                        statut === "En attente" ? "bg-yellow-100 text-yellow-800" : statut === "Approuvé" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}>
                        {statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        {statut === "En attente" ? (
                          <>
                            <button onClick={() => handleApprove(d)} className="px-2 py-1 sm:px-3 sm:py-1 bg-green-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-green-700">Valider</button>
                            <button onClick={() => handleReject(d)} className="px-2 py-1 sm:px-3 sm:py-1 bg-red-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-red-700">Refuser</button>
                          </>
                        ) : (
                          <button onClick={() => showDetails(d)} className="px-2 py-1 sm:px-3 sm:py-1 bg-gray-600 text-white rounded-md text-xs sm:text-sm font-medium hover:bg-gray-700">Voir info</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-6 sm:px-6 sm:py-8 text-center text-gray-500">Aucune demande de congé</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Modal
const DemandeModal: React.FC<any> = ({ demande, getEmploye, getStatut, handleApprove, handleReject, onClose }) => {
  const employe = getEmploye(demande);
  const statut = getStatut(demande);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">Détails de la demande</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg">&times;</button>
        </div>
        <div className="px-6 py-4 space-y-2 text-sm text-gray-700">
          <p><strong>Employé :</strong> {employe ? `${employe.nom} ${employe.prenom}` : "Inconnu"}</p>
          <p><strong>Matricule :</strong> {employe?.matricule || "N/A"}</p>
          <p><strong>Département :</strong> {employe?.departement?.nom || "Non assigné"}</p>
          <p><strong>Période :</strong> {new Date(demande.dateDebut).toLocaleDateString("fr-FR")} - {new Date(demande.dateFin).toLocaleDateString("fr-FR")}</p>
          <p><strong>Type :</strong> {demande.typeConge}</p>
          <p><strong>Durée :</strong> {demande.nbJours} jour(s)</p>
          <p><strong>Motif :</strong> {demande.motif || "N/A"}</p>
          <p><strong>Statut :</strong> {statut}</p>
          <p><strong>Soumis le :</strong> {new Date(demande.dateSoumission).toLocaleDateString("fr-FR")}</p>
          {demande.commentaireResponsable && (
            <p><strong>Commentaire :</strong> {demande.commentaireResponsable}</p>
          )}
        </div>
        {statut === "En attente" && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-2">
            <button onClick={() => { handleApprove(demande); onClose(); }} className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Valider</button>
            <button onClick={() => { handleReject(demande); onClose(); }} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">Refuser</button>
          </div>
        )}
      </div>
    </div>
  );
};