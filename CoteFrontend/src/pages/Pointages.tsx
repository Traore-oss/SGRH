/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
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
import { getEmployees } from "../Components/ServiceEmployer";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Employee {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  statut: string;
  isActive: boolean;
}

interface AttendanceRecord {
  _id?: string;
  employeeId: string;
  matricule: string;
  nom: string;
  prenom: string;
  date: string;
  statut: "Présent" | "Absent" | "Retard";
  heureArrivee: string;
  heureDepart: string;
  heuresTravaillees: string;
  retard: string;
}

export const AttendanceManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterPeriod, setFilterPeriod] = useState("jour");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date());
  const [notification, setNotification] = useState<{ type: string; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Notification
  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Mise à jour de l'heure
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Charger les employés et présences
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const employeesData = await getEmployees();
        const activeEmployees = employeesData.filter(
          (emp: Employee) => emp.statut === "Actif" && emp.isActive
        );
        setEmployees(activeEmployees);

        const today = new Date().toISOString().split("T")[0];
        const response = await fetch(`${API_BASE}/api/pointages/getByDate/${today}`, {
          credentials: "include",
        });

        let attendanceData: AttendanceRecord[] = [];

        if (response.ok) attendanceData = await response.json();

        if (attendanceData.length === 0) {
          attendanceData = activeEmployees.map((emp) => ({
            employeeId: emp._id,
            matricule: emp.matricule,
            nom: emp.nom,
            prenom: emp.prenom,
            date: today,
            statut: "Absent",
            heureArrivee: "-",
            heureDepart: "-",
            heuresTravaillees: "-",
            retard: "-",
          }));
        } else {
          activeEmployees.forEach((emp) => {
            const existingRecord = attendanceData.find((r) => r.employeeId === emp._id);
            if (!existingRecord) {
              attendanceData.push({
                employeeId: emp._id,
                matricule: emp.matricule,
                nom: emp.nom,
                prenom: emp.prenom,
                date: today,
                statut: "Absent",
                heureArrivee: "-",
                heureDepart: "-",
                heuresTravaillees: "-",
                retard: "-",
              });
            }
          });
        }

        setAttendance(attendanceData);
        setIsLoading(false);
        showNotification("success", "Données chargées avec succès");
      } catch (error) {
        setIsLoading(false);
        showNotification("error", "Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, []);

  // Sauvegarder une présence
  const saveAttendanceRecord = async (record: AttendanceRecord) => {
    try {
      const method = record._id ? "PUT" : "POST";
      const url = record._id
        ? `${API_BASE}/api/pointages/updatePresence/${record._id}`
        : `${API_BASE}/api/pointages/addAttendance`;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(record),
      });

      if (!response.ok) throw new Error("Erreur lors de la sauvegarde");

      const savedRecord = await response.json();
      setAttendance((prev) =>
        prev.map((r) =>
          r.employeeId === record.employeeId && r.date === record.date ? savedRecord : r
        )
      );

      return savedRecord;
    } catch (error) {
      showNotification("error", "Erreur lors de l'enregistrement");
      throw error;
    }
  };

  // --- Fonctions corrigées pour retourner l'objet mis à jour ---

  const markArrival = async (record: AttendanceRecord) => {
    try {
      const now = new Date();
      const heureFormat = now.toLocaleTimeString("fr-FR", { hour12: false });

      const limite = new Date(`${record.date}T08:00:00`);
      const diffSec = Math.floor((now.getTime() - limite.getTime()) / 1000);

      let updatedRecord: AttendanceRecord;
      if (diffSec > 0) {
        const totalMinutes = Math.floor(diffSec / 60);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;

        updatedRecord = {
          ...record,
          statut: "Retard",
          heureArrivee: heureFormat,
          retard: `${hours}h${minutes}m`,
        };
      } else {
        updatedRecord = {
          ...record,
          statut: "Présent",
          heureArrivee: heureFormat,
          retard: "-",
        };
      }

      const saved = await saveAttendanceRecord(updatedRecord);
      showNotification("success", "Arrivée enregistrée");
      return saved;
    } catch (error) {
      console.error(error);
      showNotification("error", "Erreur lors de l'enregistrement de l'arrivée");
      return record;
    }
  };

  const markDeparture = async (record: AttendanceRecord) => {
    if (record.statut === "Absent") {
      showNotification("error", "Veuillez marquer l'arrivée avant de marquer le départ !");
      return record;
    }

    try {
      const now = new Date();
      const heureFormat = now.toLocaleTimeString("fr-FR", { hour12: false });

      const [hours, minutes] = record.heureArrivee.split(":").map(Number);
      const start = new Date(record.date);
      start.setHours(hours, minutes, 0, 0);

      let diffMs = now.getTime() - start.getTime();
      if (diffMs < 0) diffMs += 24 * 60 * 60 * 1000;

      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

      const updatedRecord = {
        ...record,
        heureDepart: heureFormat,
        heuresTravaillees: `${diffHours}h${diffMinutes.toString().padStart(2, "0")}m`,
      };

      const saved = await saveAttendanceRecord(updatedRecord);
      showNotification("success", "Départ enregistré avec succès");
      return saved;
    } catch (error) {
      console.error(error);
      showNotification("error", "Erreur lors de l'enregistrement du départ");
      return record;
    }
  };

  const markAbsence = async (record: AttendanceRecord) => {
    try {
      const updatedRecord = {
        ...record,
        statut: "Absent",
        heureArrivee: "-",
        heureDepart: "-",
        heuresTravaillees: "-",
        retard: "-",
      };

      const saved = await saveAttendanceRecord(updatedRecord);
      showNotification("success", "Absence enregistrée");
      return saved;
    } catch (error) {
      console.error(error);
      showNotification("error", "Erreur lors de l'enregistrement de l'absence");
      return record;
    }
  };

  // --- Filtrage et statistiques ---
  const filteredAttendance = attendance.filter((r) => {
    const recordDate = new Date(r.date);
    const selectedDate = new Date(filterDate);
    let dateMatch = true;

    if (filterPeriod === "jour") {
      dateMatch = recordDate.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];
    } else if (filterPeriod === "semaine") {
      const getWeek = (d: Date) => {
        const onejan = new Date(d.getFullYear(), 0, 1);
        return Math.ceil((((d.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() + 1) / 7));
      };
      dateMatch = getWeek(recordDate) === getWeek(selectedDate) && recordDate.getFullYear() === selectedDate.getFullYear();
    } else {
      dateMatch = recordDate.getMonth() === selectedDate.getMonth() && recordDate.getFullYear() === selectedDate.getFullYear();
    }

    if (!dateMatch) return false;
    if (filterStatus !== "Tous" && r.statut !== filterStatus) return false;

    if (searchTerm && !r.matricule.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.nom.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !r.prenom.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    return true;
  });

  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter((r) => r.statut === "Présent").length,
    retard: filteredAttendance.filter((r) => r.statut === "Retard").length,
    absent: filteredAttendance.filter((r) => r.statut === "Absent").length,
  };

  const pieData = {
    labels: ["Présents", "Retards", "Absents"],
    datasets: [
      {
        data: [stats.present, stats.retard, stats.absent],
        backgroundColor: ["#16a34a", "#f59e0b", "#dc2626"],
        borderWidth: 0,
        hoverOffset: 12,
      },
    ],
  };

  const barData = {
    labels: ["Présents", "Retards", "Absents"],
    datasets: [
      {
        label: "Nombre d'employés",
        data: [stats.present, stats.retard, stats.absent],
        backgroundColor: ["#16a34a", "#f59e0b", "#dc2626"],
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: { usePointStyle: true, padding: 20, font: { size: 14 } },
      },
    },
  };

  const barOptions = { 
    responsive: true, 
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-6">
      <div className="max-w-7xl mx-auto">
        {/* En-tête */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">Gestion des Présences</h1>
          <div className="text-sm sm:text-base text-gray-600">
            {time.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} | 
            <span className="ml-1 sm:ml-2 font-mono">{time.toLocaleTimeString('fr-FR')}</span>
          </div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mb-6 sm:mb-8">
          <div className="bg-white rounded-lg shadow-sm p-4 border border-blue-100">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Total Employés</p>
                <p className="text-lg font-semibold text-gray-900">{employees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-green-100">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-2 mr-3">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Présents</p>
                <p className="text-lg font-semibold text-gray-900">{stats.present}</p>
                <p className="text-xs text-gray-400">{stats.present > 0 ? `${Math.round((stats.present / employees.length) * 100)}%` : '0%'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-yellow-100">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2 mr-3">
                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Retards</p>
                <p className="text-lg font-semibold text-gray-900">{stats.retard}</p>
                <p className="text-xs text-gray-400">{stats.retard > 0 ? `${Math.round((stats.retard / employees.length) * 100)}%` : '0%'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 border border-red-100">
            <div className="flex items-center">
              <div className="rounded-full bg-red-100 p-2 mr-3">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Absents</p>
                <p className="text-lg font-semibold text-gray-900">{stats.absent}</p>
                <p className="text-xs text-gray-400">{stats.absent > 0 ? `${Math.round((stats.absent / employees.length) * 100)}%` : '0%'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-100">
          <h3 className="text-base font-semibold text-gray-800 mb-3">Filtres et Recherche</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rechercher</label>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Matricule, nom ou prénom" 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Période</label>
              <select 
                value={filterPeriod} 
                onChange={(e) => setFilterPeriod(e.target.value)} 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="jour">Jour</option>
                <option value="semaine">Semaine</option>
                <option value="mois">Mois</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)} 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Statut</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Tous">Tous</option>
                <option value="Présent">Présent</option>
                <option value="Retard">Retard</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diagrammes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-3 text-center">Répartition des présences</h3>
            <div className="h-60">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-base font-semibold text-gray-800 mb-3 text-center">Statistiques des présences</h3>
            <div className="h-60">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* Tableau des présences */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
          <div className="px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base font-semibold text-gray-800">Liste des présences</h3>
            <span className="text-xs text-gray-500">{filteredAttendance.length} employé(s) trouvé(s)</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Arrivée</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Départ</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Heures</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Retard</th>
                  <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((r) => (
                    <tr key={`${r.employeeId}-${r.date}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{r.matricule}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.nom}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{r.prenom}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full
                          ${r.statut === "Présent" ? "bg-green-100 text-green-800" : 
                            r.statut === "Retard" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"}`}>
                          {r.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{r.heureArrivee}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{r.heureDepart}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{r.heuresTravaillees}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{r.retard}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`arrival-${r.employeeId}`}
                              checked={r.statut !== "Absent"}
                              onChange={() => r.statut === "Absent" ? markArrival(r) : markAbsence(r)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`arrival-${r.employeeId}`} className="ml-2 block text-xs text-gray-700">
                              {r.statut === "Absent" ? "Marquer arrivée" : "Marquer absence"}
                            </label>
                          </div>
                          
                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`departure-${r.employeeId}`}
                              checked={r.heureDepart !== "-"}
                              onChange={() => r.heureDepart === "-" ? markDeparture(r) : null}
                              disabled={r.statut === "Absent" || r.heureDepart !== "-"}
                              className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded disabled:opacity-50"
                            />
                            <label htmlFor={`departure-${r.employeeId}`} className="ml-2 block text-xs text-gray-700">
                              Marquer départ
                            </label>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="px-4 py-6 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm font-medium">Aucun employé trouvé</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};