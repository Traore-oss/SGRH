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
    const res = await fetch(`${API_BASE}/api/pointages/updatePresence`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ attendances: records }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour de la présence");
    }

    return await res.json(); // tableau de présences mis à jour
  } catch (err: any) {
    console.error("updatePresenceBulk error:", err.message || err);
    return null;
  }
};


const setDeparture = async (employeId: string, date: string): Promise<AttendanceRecord | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/setDeparture`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ employeId, date }),
    });
    if (!res.ok) throw new Error("Erreur lors de l'enregistrement du départ");
    const data: AttendanceRecord = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

// === Composant principal ===
export const AttendanceManager: React.FC = () => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(new Date());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterPeriod, setFilterPeriod] = useState("jour");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showNotification = (type: "success" | "error", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const employeesData = await getEmployees();
        setEmployees(employeesData);

        const today = new Date().toISOString().split("T")[0];
        const attendanceData = await getAttendancesByDate(today);

        const mergedAttendance = employeesData.map(emp => {
          const record = attendanceData.find(a => a.employe._id === emp._id);
          if (record) return { ...record, employe: emp };
          return {
            employe: emp,
            date: today,
            statut: "Absent",
            heureArrivee: "-",
            heureDepart: "-",
            heuresTravaillees: "-",
            retard: "-",
          };
        });

        setAttendance(mergedAttendance);
        setIsLoading(false);
        showNotification("success", "Données chargées avec succès");
      } catch {
        setIsLoading(false);
        showNotification("error", "Erreur lors du chargement des données");
      }
    };
    fetchData();
  }, []);

  const togglePresence = async (record: AttendanceRecord, checked: boolean) => {
    const updatedRecord = await updatePresenceBulk([{ employeId: record.employe._id, date: record.date, checked }]);
    if (updatedRecord) {
      setAttendance(prev =>
        prev.map(r => r.employe._id === record.employe._id && r.date === record.date
          ? { ...updatedRecord, employe: record.employe }
          : r
        )
      );
      showNotification("success", "Présence mise à jour avec succès");
    } else {
      showNotification("error", "Erreur lors de la mise à jour de la présence");
    }
  };

  const handleSetDeparture = async (record: AttendanceRecord) => {
    if (record.statut === "Absent") {
      showNotification("error", "Veuillez cocher l'arrivée avant de marquer le départ !");
      return;
    }
    const updatedRecord = await setDeparture(record.employe._id, record.date);
    if (updatedRecord) {
      setAttendance(prev =>
        prev.map(r => r.employe._id === record.employe._id && r.date === record.date
          ? { ...updatedRecord, employe: record.employe }
          : r
        )
      );
      showNotification("success", "Départ enregistré avec succès");
    } else {
      showNotification("error", "Erreur lors de l'enregistrement du départ");
    }
  };

  // Correction de l'erreur de recherche - vérification des propriétés
const filteredAttendance = attendance.filter(r => {
  const recordDate = new Date(r.date);
  const selectedDate = filterDate ? new Date(filterDate) : null;

  // Si la date n'est pas valide → on ignore
  if (isNaN(recordDate.getTime()) || !selectedDate || isNaN(selectedDate.getTime())) {
    return false;
  }

  let dateMatch = false;
  if (filterPeriod === "jour") {
    dateMatch = recordDate.toISOString().split("T")[0] === selectedDate.toISOString().split("T")[0];
  } else if (filterPeriod === "semaine") {
    const getWeekNumber = (date: Date) =>
      Math.ceil(((date.getTime() - new Date(date.getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);

    dateMatch = getWeekNumber(recordDate) === getWeekNumber(selectedDate);
  } else if (filterPeriod === "mois") {
    dateMatch =
      recordDate.getMonth() === selectedDate.getMonth() &&
      recordDate.getFullYear() === selectedDate.getFullYear();
  } else {
    dateMatch = true; // si aucun filtre
  }

  if (!dateMatch) return false;
  if (filterStatus !== "Tous" && r.statut !== filterStatus) return false;

  if (searchTerm) {
    const nom = r.employe?.nom || "";
    const prenom = r.employe?.prenom || "";
    const matricule = r.employe?.matricule || "";

    const searchTermLower = searchTerm.toLowerCase();
    if (
      !nom.toLowerCase().includes(searchTermLower) &&
      !prenom.toLowerCase().includes(searchTermLower) &&
      !matricule.toLowerCase().includes(searchTermLower)
    ) {
      return false;
    }
  }

  return true;
});


  const stats = {
    total: filteredAttendance.length,
    present: filteredAttendance.filter(r => r.statut === "Présent").length,
    retard: filteredAttendance.filter(r => r.statut === "Retard").length,
    absent: filteredAttendance.filter(r => r.statut === "Absent").length,
  };

  const pieData = {
    labels: ["Présents", "Retards", "Absents"],
    datasets: [{
      data: [stats.present, stats.retard, stats.absent],
      backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      borderWidth: 0,
      hoverOffset: 12
    }]
  };

  const barData = {
    labels: ["Présents", "Retards", "Absents"],
    datasets: [{
      label: "Nombre d'employés",
      data: [stats.present, stats.retard, stats.absent],
      backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
      borderRadius: 8,
      borderSkipped: false
    }]
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
          font: { size: 12 },
          color: "#374151"
        } 
      }
    }
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1F2937",
        titleColor: "#F9FAFB",
        bodyColor: "#F9FAFB",
        cornerRadius: 8,
        displayColors: false
      }
    },
    scales: { 
      y: { 
        beginAtZero: true, 
        ticks: { stepSize: 1 },
        grid: { color: "#E5E7EB" }
      },
      x: {
        grid: { display: false }
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-2 sm:py-6 sm:px-4 lg:py-8 lg:px-6">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === "success" 
            ? "bg-green-50 text-green-800 border border-green-200" 
            : "bg-red-50 text-red-800 border border-red-200"
        }`}>
          <div className="flex items-center">
            {notification.type === "success" ? (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}

      {/* En-tête responsive */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gestion des Présences</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">Suivi des arrivées, départs et retards des employés</p>
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-sm w-full md:w-auto">
          <p className="text-base sm:text-lg font-semibold text-gray-800 font-mono">
            {time.toLocaleTimeString('fr-FR')}
          </p>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {time.toLocaleDateString('fr-FR', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Statistiques résumées responsive */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm border-l-4 border-blue-500">
          <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Total employés</div>
        </div>
        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm border-l-4 border-green-500">
          <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.present}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Présents</div>
        </div>
        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm border-l-4 border-yellow-500">
          <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.retard}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Retards</div>
        </div>
        <div className="bg-white p-3 sm:p-4 md:p-5 rounded-lg sm:rounded-xl shadow-sm border-l-4 border-red-500">
          <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.absent}</div>
          <div className="text-xs sm:text-sm text-gray-600 mt-1">Absents</div>
        </div>
      </div>

      {/* Graphiques responsive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 md:gap-6 mb-6 md:mb-8">
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 10a8 8 0 1116 0 8 8 0 01-16 0zm8-6a6 6 0 00-6 6c0 1.887.454 3.665 1.257 5.234a.5.5 0 00.656.254L10 14.21l4.087 2.278a.5.5 0 00.656-.254A5.98 5.98 0 0016 10a6 6 0 00-6-6z" />
            </svg>
            Répartition des présences
          </h3>
          <div className="h-60 sm:h-64 md:h-72">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
        <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-md">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 flex items-center">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zm6-4a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zm6-3a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            Statistiques de présence
          </h3>
          <div className="h-60 sm:h-64 md:h-72">
            <Bar data={barData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Filtres responsive */}
      <div className="bg-white p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-md mb-4 sm:mb-5 md:mb-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Filtres</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Recherche</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Nom, prénom ou matricule"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-8 sm:pl-10 w-full p-2 sm:p-3 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Statut</label>
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            >
              <option value="Tous">Tous les statuts</option>
              <option value="Présent">Présent</option>
              <option value="Absent">Absent</option>
              <option value="Retard">Retard</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Période</label>
            <select
              value={filterPeriod}
              onChange={e => setFilterPeriod(e.target.value)}
              className="w-full p-2 sm:p-3 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
            >
              <option value="jour">Jour</option>
              <option value="semaine">Semaine</option>
              <option value="mois">Mois</option>
            </select>
          </div>
          
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Date</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
                <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="date"
                value={filterDate}
                onChange={e => setFilterDate(e.target.value)}
                className="pl-8 sm:pl-10 w-full p-2 sm:p-3 border border-gray-300 rounded-md sm:rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tableau responsive */}
      <div className="bg-white rounded-xl sm:rounded-2xl shadow-md overflow-hidden">
        {isLoading ? (
          <div className="p-8 sm:p-10 md:p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <p className="mt-3 sm:mt-4 text-gray-600 text-sm sm:text-base">Chargement des données...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      #
                    </th>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom & Prénom
                    </th>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                      Matricule
                    </th>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Arrivée
                    </th>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Départ
                    </th>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Heures
                    </th>
                    <th scope="col" className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendance.map((record, idx) => (
                    <tr key={record.employe._id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{record.employe.nom} {record.employe.prenom}</div>
                          <div className="text-xs text-gray-500 sm:hidden">{record.employe.matricule}</div>
                        </div>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">
                        {record.employe.matricule}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-0.5 rounded-full text-xs font-medium ${
                          record.statut === "Présent" 
                            ? "bg-green-100 text-green-800" 
                            : record.statut === "Retard" 
                            ? "bg-yellow-100 text-yellow-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {record.statut}
                        </span>
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {record.heureArrivee}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900 hidden md:table-cell">
                        {record.heureDepart}
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {record.heuresTravaillees}h
                      </td>
                      <td className="px-3 py-2 sm:px-4 sm:py-3 md:px-6 md:py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                          {/* Checkbox moderne pour la présence - version responsive */}
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              checked={record.statut !== "Absent"} 
                              onChange={e => togglePresence(record, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-4 sm:peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-2 text-xs sm:text-sm font-medium text-gray-900 hidden sm:block">
                              {record.statut !== "Absent" ? "Présent" : "Absent"}
                            </span>
                          </label>
                          
                          {/* Bouton moderne pour le départ */}
                          <button 
                            onClick={() => handleSetDeparture(record)}
                            disabled={record.statut === "Absent"}
                            className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1.5 border border-transparent text-xs font-medium rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                              record.statut === "Absent" 
                                ? "bg-gray-200 text-gray-500 cursor-not-allowed" 
                                : "bg-indigo-600 text-white hover:bg-indigo-700"
                            }`}
                          >
                            <svg className="-ml-0.5 mr-1 h-3 w-3 sm:h-4 sm:w-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <span className="hidden sm:inline">Départ</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredAttendance.length === 0 && (
              <div className="p-8 sm:p-10 md:p-12 text-center">
                <svg className="mx-auto h-12 w-12 sm:h-16 sm:w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-base sm:text-lg font-medium text-gray-900">Aucun enregistrement trouvé</h3>
                <p className="mt-1 text-sm text-gray-500">Essayez de modifier vos critères de recherche.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AttendanceManager;