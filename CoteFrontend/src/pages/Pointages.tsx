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
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Departement {
  _id: string;
  nom: string;
}

export interface Employee {
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  poste: string;
  departement?: Departement;
  salaire: string | number;
  typeContrat: "CDI" | "CDD";
  role: string;
  photo?: string;
}

export interface AttendanceRecord {
  _id?: string;
  employe: Employee;
  date: string;
  statut: "Présent" | "Absent" | "Retard";
  heureArrivee: string;
  heureDepart: string;
  heuresTravaillees: string;
  retard: string;
  departureMarked?: boolean;
}

// === Fonctions API ===
const getEmployees = async (): Promise<Employee[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/Users/`, { credentials: "include" });
    if (!res.ok) throw new Error("Erreur lors de la récupération des employés");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

const getAttendancesByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/getAttendances?date=${date}`, { credentials: "include" });
    if (!res.ok) throw new Error("Erreur lors de la récupération des présences");
    return await res.json();
  } catch (err) {
    console.error(err);
    return [];
  }
};

const updatePresenceBulk = async (records: { employeId: string; date: string; checked: boolean }[]) => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/bulk`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ attendances: records }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour des présences");
    }
    return await res.json();
  } catch (err: any) {
    console.error("updatePresenceBulk error:", err.message || err);
    return null;
  }
};

const setDeparture = async (employeId: string, date: string): Promise<AttendanceRecord | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/depart`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ employeId, date }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Erreur API: ${text}`);
    }
    const updatedData: Partial<AttendanceRecord> = await res.json();
    return {
      _id: updatedData._id || "",
      employe: updatedData.employe || null!,
      date: updatedData.date || date,
      statut: updatedData.statut || "Présent",
      heureArrivee: updatedData.heureArrivee || "-",
      heureDepart: updatedData.heureDepart || "-",
      heuresTravaillees: updatedData.heuresTravaillees || "-",
      retard: updatedData.retard || "-",
    };
  } catch (err) {
    console.error("setDeparture error:", err);
    return null;
  }
};

// === Composant principal ===
const AttendanceManager: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [time, setTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterPeriod, setFilterPeriod] = useState("jour");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // === Actualisation de l'heure en temps réel ===
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // === Fetch et gestion historique ===
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const today = new Date().toISOString().split("T")[0];

      // Historique complet
      const attendanceHistoryStr = localStorage.getItem("attendanceHistory");
      const attendanceHistory: Record<string, AttendanceRecord[]> = attendanceHistoryStr
        ? JSON.parse(attendanceHistoryStr)
        : {};

      const employeesData = await getEmployees();
      let attendanceData: AttendanceRecord[] = [];

      if (attendanceHistory[today]) {
        attendanceData = attendanceHistory[today];
      } else {
        const apiData = await getAttendancesByDate(today);
        attendanceData = employeesData.map(emp => {
          const record = apiData.find(a => a.employe._id === emp._id);
          return record
            ? { ...record, employe: emp }
            : {
                employe: emp,
                date: today,
                statut: "Absent",
                heureArrivee: "-",
                heureDepart: "-",
                heuresTravaillees: "-",
                retard: "-",
              };
        });
        // Sauvegarder dans l'historique
        attendanceHistory[today] = attendanceData;
        localStorage.setItem("attendanceHistory", JSON.stringify(attendanceHistory));
      }

      setEmployees(employeesData);
      setAttendance(attendanceData);
      setIsLoading(false);
      showNotification("success", "Données chargées avec succès");
    } catch {
      setIsLoading(false);
      showNotification("error", "Erreur lors du chargement des données");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchData();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  // === Mise à jour locale + historique ===
  const updateAttendanceAndHistory = (updatedRecords: AttendanceRecord[]) => {
    setAttendance(updatedRecords);
    const today = new Date().toISOString().split("T")[0];
    const attendanceHistoryStr = localStorage.getItem("attendanceHistory");
    const attendanceHistory: Record<string, AttendanceRecord[]> = attendanceHistoryStr ? JSON.parse(attendanceHistoryStr) : {};
    attendanceHistory[today] = updatedRecords;
    localStorage.setItem("attendanceHistory", JSON.stringify(attendanceHistory));
  };

  // === Gestion présences ===
  const togglePresence = async (record: AttendanceRecord, checked: boolean) => {
    const updatedRecords = await updatePresenceBulk([{ employeId: record.employe._id, date: record.date, checked }]);
    if (updatedRecords && Array.isArray(updatedRecords)) {
      const newData = attendance.map(r => {
        const updated = updatedRecords.find(u => u.employe._id === r.employe._id && u.date === r.date);
        return updated
          ? { ...r, statut: updated.statut, heureArrivee: updated.heureArrivee }
          : r;
      });
      updateAttendanceAndHistory(newData);
      showNotification("success", "Arrivée mise à jour avec succès");
    } else {
      showNotification("error", "Erreur lors de la mise à jour de l'arrivée");
    }
  };

  // === Gestion départ ===
  const handleSetDeparture = async (record: AttendanceRecord) => {
    if (record.statut === "Absent") {
      showNotification("error", "Veuillez pointer l'arrivée avant de marquer le départ !");
      return;
    }

    const updatedRecord = await setDeparture(record.employe._id, record.date);
    if (updatedRecord) {
      const newData = attendance.map(r =>
        r.employe._id === record.employe._id && r.date === record.date
          ? { ...r, heureDepart: updatedRecord.heureDepart, departureMarked: true }
          : r
      );
      updateAttendanceAndHistory(newData);
      showNotification("success", "Départ enregistré avec succès");
    } else {
      showNotification("error", "Erreur lors de l'enregistrement du départ");
    }
  };

  // === Filtres ===
  const filteredAttendance = attendance.filter(r => {
    const recordDate = new Date(r.date);
    const selectedDate = filterDate ? new Date(filterDate) : null;
    if (!selectedDate || isNaN(recordDate.getTime())) return false;

    let dateMatch = false;
    if (filterPeriod === "jour") {
      dateMatch = recordDate.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];
    } else if (filterPeriod === "semaine") {
      const getWeekNumber = (date: Date) =>
        Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);
      dateMatch = getWeekNumber(recordDate) === getWeekNumber(selectedDate);
    } else if (filterPeriod === "mois") {
      dateMatch = recordDate.getMonth() === selectedDate.getMonth() && recordDate.getFullYear() === selectedDate.getFullYear();
    } else dateMatch = true;

    if (!dateMatch) return false;
    if (filterStatus !== "Tous" && r.statut !== filterStatus) return false;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      if (![r.employe.nom, r.employe.prenom, r.employe.matricule].some(s => (s ?? "").toLowerCase().includes(term))) return false;
    }
    return true;
  });

  // === Statistiques ===
  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(r => r.statut === "Présent").length,
    retard: filteredAttendance.filter(r => r.statut === "Retard").length,
    absent: filteredAttendance.filter(r => r.statut === "Absent").length,
  };

  const pieData = {
    labels: ["Présents", "Retards", "Absents"],
    datasets: [{ data: [stats.present, stats.retard, stats.absent], backgroundColor: ["#10B981", "#F59E0B", "#EF4444"], hoverOffset: 12 }],
  };

  const barData = {
    labels: ["Présents", "Retards", "Absents"],
    datasets: [{ label: "Nombre d'employés", data: [stats.present, stats.retard, stats.absent], backgroundColor: ["#10B981", "#F59E0B", "#EF4444"], borderRadius: 8, borderSkipped: false }],
  };

  const pieOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom" as const, labels: { usePointStyle: true, padding: 20, font: { size: 12 }, color: "#374151" } } } };
  const barOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false }, tooltip: { backgroundColor: "#1F2937", titleColor: "#F9FAFB", bodyColor: "#F9FAFB", cornerRadius: 8, displayColors: false } }, scales: { y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: "#E5E7EB" } }, x: { grid: { display: false } } } };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-6 transition-all duration-300 animate-fadeIn">
      {/* En-tête avec horloge animée */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 p-4 bg-white rounded-xl shadow-md transition-all duration-300 hover:shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2 md:mb-0 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Gestion des Présences
        </h1>
        <div className="flex items-center space-x-2">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white p-2 rounded-lg shadow-md animate-pulse">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-mono">{time.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Filtres et contrôles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6 p-4 bg-white rounded-xl shadow-md transition-all duration-300">
        <input 
          type="date" 
          value={filterDate} 
          onChange={e => setFilterDate(e.target.value)} 
          className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
        />
        <select 
          value={filterPeriod} 
          onChange={e => setFilterPeriod(e.target.value)} 
          className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        >
          <option value="jour">Jour</option>
          <option value="semaine">Semaine</option>
          <option value="mois">Mois</option>
        </select>
        <select 
          value={filterStatus} 
          onChange={e => setFilterStatus(e.target.value)} 
          className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
        >
          <option value="Tous">Tous</option>
          <option value="Présent">Présent</option>
          <option value="Retard">Retard</option>
          <option value="Absent">Absent</option>
        </select>
        <input 
          type="text" 
          placeholder="Rechercher..." 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          className="p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300" 
        />
        <button 
          onClick={handleRefresh} 
          disabled={isRefreshing} 
          className="flex items-center justify-center bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:transform-none"
        >
          {isRefreshing ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Rafraîchissement...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Rafraîchir
            </>
          )}
        </button>
      </div>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-blue-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-gray-500 text-sm">Total employés</h2>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-green-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-gray-500 text-sm">Présents</h2>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-yellow-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-gray-500 text-sm">Retards</h2>
              <p className="text-2xl font-bold text-yellow-500">{stats.retard}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-5 rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105">
          <div className="flex items-center">
            <div className="rounded-full bg-red-100 p-3 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-gray-500 text-sm">Absents</h2>
              <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="flex flex-col md:flex-row gap-6 mb-6">
        <div className="bg-white p-5 rounded-xl shadow-md w-full md:w-1/2 h-80 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Répartition des présences</h3>
          <Pie data={pieData} options={pieOptions} />
        </div>
        <div className="bg-white p-5 rounded-xl shadow-md w-full md:w-1/2 h-80 transition-all duration-300 hover:shadow-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Statistiques des présences</h3>
          <Bar data={barData} options={barOptions} />
        </div>
      </div>

      {/* Tableau des présences */}
     <div className="overflow-x-auto bg-white rounded-xl shadow-md p-5 transition-all duration-300">
  <h3 className="text-lg font-semibold text-gray-800 mb-4">Liste des employés</h3>
  <table className="min-w-full border-collapse">
    <thead>
      <tr className="bg-gray-100 rounded-lg">
        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tl-lg">
          Matricule
        </th>
        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Nom
        </th>
        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Prénom
        </th>
        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Statut
        </th>
        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Heure arrivée
        </th>
        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Heure départ
        </th>
        <th className="p-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rounded-tr-lg">
          Action
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200">
      {filteredAttendance.map((record, index) => (
        <tr
          key={record.employe._id + record.date}
          className="hover:bg-blue-50 transition-colors duration-200"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <td className="p-3 text-sm text-gray-700">{record.employe.matricule}</td>
          <td className="p-3 text-sm font-medium text-gray-900">{record.employe.nom}</td>
          <td className="p-3 text-sm text-gray-700">{record.employe.prenom}</td>
          <td className="p-3 text-sm">
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${
                record.statut === "Présent"
                  ? "bg-green-100 text-green-800"
                  : record.statut === "Retard"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {record.statut}
            </span>
          </td>
          <td className="p-3 text-sm text-gray-700">{record.heureArrivee || "-"}</td>
          <td className="p-3 text-sm text-gray-700">{record.heureDepart || "-"}</td>
          <td className="p-3 text-sm">
            <div className="flex items-center space-x-3">
              {/* Checkbox pour marquer la présence */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={record.statut !== "Absent"}
                  onChange={(e) => togglePresence(record, e.target.checked)}
                  disabled={record.statut === "Retard"} // facultatif si on veut bloquer certaines cases
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>

              {/* Bouton Départ */}
              <button
                onClick={() => handleSetDeparture(record)}
                disabled={record.statut === "Absent"}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 ${
                  record.statut === "Absent"
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700"
                }`}
              >
                <div className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Départ
                </div>
              </button>
            </div>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
</div>


      {/* Notification */}
      {notification && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg flex items-center animate-slideInRight ${
            notification.type === "success" 
              ? "bg-green-500 text-white" 
              : "bg-red-500 text-white"
          }`}
        >
          {notification.type === "success" ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {notification.message}
        </div>
      )}

      {/* Styles d'animation CSS intégrés */}
      <style>
        {`
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
        `}
      </style>
    </div>
  );
};

export default AttendanceManager;