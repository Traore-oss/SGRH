/* eslint-disable react-refresh/only-export-components */
// /* eslint-disable react-refresh/only-export-components */ 
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

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// 🔹 Interface pour un département
export interface Departement {
  _id: string;
  nom: string;
}

// 🔹 Interface pour un employé tel que retourné par l'API
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

// 🔹 Récupérer tous les employés
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/Users/`, {
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

// 🔹 Fonctions API pour la gestion des présences
const getAttendancesByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/getByDate?date=${date}`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erreur lors de la récupération des présences');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const addAttendance = async (matricule: string, date: string): Promise<AttendanceRecord | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/addAttendance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ matricule, date }),
    });
    if (!res.ok) throw new Error('Erreur lors de l\'ajout de la présence');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const updatePresence = async (matricule: string, date: string, checked: boolean): Promise<AttendanceRecord | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/updatePresence`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ matricule, date, checked }),
    });
    if (!res.ok) throw new Error('Erreur lors de la mise à jour de la présence');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const setDeparture = async (matricule: string, date: string): Promise<AttendanceRecord | null> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/setDeparture`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ matricule, date }),
    });
    if (!res.ok) throw new Error('Erreur lors de l\'enregistrement du départ');
    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
};

const deleteAttendance = async (id: string): Promise<boolean> => {
  try {
    const res = await fetch(`${API_BASE}/api/pointages/deleteAttendance/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Erreur lors de la suppression de la présence');
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export const AttendanceManager: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("Tous");
  const [filterPeriod, setFilterPeriod] = useState("mois");
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split("T")[0]);
  const [time, setTime] = useState(new Date());
  const [notification, setNotification] = useState<{type: string, message: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Afficher une notification temporaire
  const showNotification = (type: string, message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  // Mise à jour de l'heure en temps réel
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Charger les données depuis l'API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Récupération des employés depuis l'API
        const employeesData = await getEmployees();
        setEmployees(employeesData);
        
        // Récupération des présences pour la date actuelle
        const today = new Date().toISOString().split("T")[0];
        const attendanceData = await getAttendancesByDate(today);
        
        // Si des présences existent déjà pour aujourd'hui
        if (attendanceData.length > 0) {
          setAttendance(attendanceData);
        } else {
          // Créer des enregistrements de présence par défaut pour tous les employés
          const defaultAttendance = employeesData.map(emp => ({
            employeeId: emp._id,
            matricule: emp.matricule,
            nom: emp.nom,
            prenom: emp.prenom,
            date: today,
            statut: "Absent" as const,
            heureArrivee: "-",
            heureDepart: "-",
            heuresTravaillees: "-",
            retard: "-",
          }));
          
          // Ajouter chaque présence au backend
          for (const record of defaultAttendance) {
            await addAttendance(record.matricule, record.date);
          }
          
          setAttendance(defaultAttendance);
        }
        
        setIsLoading(false);
        showNotification("success", "Données chargées avec succès");
      } catch (error) {
        setIsLoading(false);
        showNotification("error", "Erreur lors du chargement des données");
      }
    };

    fetchData();
  }, []);

  // Marquer présence / retard
  const togglePresence = async (record: AttendanceRecord, checked: boolean) => {
    try {
      const updatedRecord = await updatePresence(record.matricule, record.date, checked);
      
      if (updatedRecord) {
        setAttendance((prev) => 
          prev.map((r) => 
            r.matricule === record.matricule && r.date === record.date ? updatedRecord : r
          )
        );
        showNotification("success", "Présence mise à jour avec succès");
      } else {
        showNotification("error", "Erreur lors de la mise à jour de la présence");
      }
    } catch (error) {
      showNotification("error", "Erreur lors de la mise à jour de la présence");
    }
  };

  // Marquer départ
  const handleSetDeparture = async (record: AttendanceRecord) => {
    if (record.statut === "Absent") {
      showNotification("error", "Veuillez cocher la case d'arrivée avant de marquer le départ !");
      return;
    }
    
    try {
      const updatedRecord = await setDeparture(record.matricule, record.date);
      
      if (updatedRecord) {
        setAttendance((prev) => 
          prev.map((r) => 
            r.matricule === record.matricule && r.date === record.date ? updatedRecord : r
          )
        );
        showNotification("success", "Départ enregistré avec succès");
      } else {
        showNotification("error", "Erreur lors de l'enregistrement du départ");
      }
    } catch (error) {
      showNotification("error", "Erreur lors de l'enregistrement du départ");
    }
  };

  // Supprimer une présence
  const handleDeleteAttendance = async (id: string) => {
    try {
      const success = await deleteAttendance(id);
      if (success) {
        setAttendance(prev => prev.filter(record => record._id !== id));
        showNotification("success", "Présence supprimée avec succès");
      } else {
        showNotification("error", "Erreur lors de la suppression de la présence");
      }
    } catch (error) {
      showNotification("error", "Erreur lors de la suppression de la présence");
    }
  };

  // Filtrer les données
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
    
    // Filtre de recherche
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
        hoverOffset: 12
      }
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

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
    },
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
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-blue-100">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-2 sm:p-3 mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Total Employés</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{employees.length}</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-500">Présents</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.present}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-3 sm:p-4 lg:p-5 border border-yellow-100">
            <div className="flex items-center">
              <div className="rounded-full bg-yellow-100 p-2 sm:p-3 mr-3 sm:mr-4">
                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 01118 0z"></path>
                </svg>
              </div>
              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Retards</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.retard}</p>
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
                <p className="text-xs sm:text-sm font-medium text-gray-500">Absents</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">{stats.absent}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Diagrammes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6 sm:mb-8">
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">Répartition des présences</h3>
            <div className="h-60 sm:h-72 lg:h-80">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
          <div className="bg-white p-4 sm:p-5 lg:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4 text-center">Statistiques des présences</h3>
            <div className="h-60 sm:h-72 lg:h-80">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-5 lg:p-6 mb-6 sm:mb-8 border border-gray-100">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Filtres et Recherche</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 items-end">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Rechercher un employé</label>
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder="Matricule, nom ou prénom" 
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Période</label>
              <select 
                value={filterPeriod} 
                onChange={(e) => setFilterPeriod(e.target.value)} 
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="jour">Jour</option>
                <option value="semaine">Semaine</option>
                <option value="mois">Mois</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Date</label>
              <input 
                type="date" 
                value={filterDate} 
                onChange={(e) => setFilterDate(e.target.value)} 
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition" 
              />
            </div>
            
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)} 
                className="w-full px-3 py-2 sm:px-4 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              >
                <option value="Tous">Tous les statuts</option>
                <option value="Présent">Présent</option>
                <option value="Retard">Retard</option>
                <option value="Absent">Absent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tableau des présences */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm overflow-hidden border border-gray-100">
          <div className="px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Liste des présences</h3>
            <span className="text-xs sm:text-sm text-gray-500">{filteredAttendance.length} employé(s) trouvé(s)</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Matricule</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom & Prénom</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Heure Arrivée</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">Heure Départ</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Heures Travaillées</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">Retard</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Présence</th>
                  <th scope="col" className="px-4 py-2 sm:px-6 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((r) => (
                  <tr key={r._id || `${r.matricule}-${r.date}`} className="hover:bg-gray-50">
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm font-medium text-gray-900">{r.matricule}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-900">{r.nom} {r.prenom}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden sm:table-cell">{r.date}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full
                          ${r.statut === "Présent" ? "bg-green-100 text-green-800" : 
                            r.statut === "Retard" ? "bg-yellow-100 text-yellow-800" : 
                            "bg-red-100 text-red-800"}`}>
                          {r.statut}
                        </span>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{r.heureArrivee}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">{r.heureDepart}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">{r.heuresTravaillees}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500 hidden xl:table-cell">{r.retard}</td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={r.statut !== "Absent"} 
                            onChange={(e) => togglePresence(r, e.target.checked)} 
                            className="sr-only peer" 
                          />
                          <div className={`w-10 h-5 sm:w-11 sm:h-6 rounded-full peer 
                            ${r.statut !== "Absent" ? 'bg-blue-600' : 'bg-gray-200'} 
                            peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] 
                            after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all`}
                          ></div>
                        </label>
                      </td>
                      <td className="px-4 py-3 sm:px-6 sm:py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                          onClick={() => handleSetDeparture(r)} 
                          disabled={r.statut === "Absent"}
                          className={`px-2 py-1 sm:px-3 sm:py-1 rounded-md text-xs sm:text-sm font-medium flex items-center
                            ${r.statut === "Absent" ? 
                              "bg-gray-200 text-gray-400 cursor-not-allowed" : 
                              "bg-purple-600 text-white hover:bg-purple-700"}`}
                        >
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                          </svg>
                          Départ
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-4 py-6 sm:px-6 sm:py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <p className="text-sm sm:text-base font-medium">Aucun employé trouvé</p>
                        <p className="mt-1 text-xs sm:text-sm">Aucune donnée ne correspond à vos critères de recherche</p>
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