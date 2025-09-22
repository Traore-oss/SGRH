import { useCallback, useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getAttendancesByDate, type AttendanceRecord } from "../Components/PointageServices";

interface EmployeeAttendanceProps {
  days?: number;
}

export const EmployeeAttendance: React.FC<EmployeeAttendanceProps> = ({ days = 7 }) => {
  const { user } = useAuth();
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Formater heure "HH:mm:ss" -> "HH:mm"
  const formatTime = (time?: string) => {
    if (!time || time === "-") return "-";
    const parts = time.split(":");
    if (parts.length >= 2) return `${parts[0]}:${parts[1]}`;
    return time;
  };

  // 🔹 Récupération de l'historique
  const fetchAttendanceHistory = useCallback(async () => {
    if (!user?._id) {
      setError("Utilisateur non défini");
      setAttendanceHistory([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const history: AttendanceRecord[] = [];
      const now = new Date();

      for (let i = 0; i < days; i++) {
        const date = new Date();
        date.setDate(now.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        // 🔹 Appel backend pour récupérer tous les pointages du jour
        const res: AttendanceRecord[] = await getAttendancesByDate(dateStr);

        // 🔹 Chercher le pointage de l'utilisateur courant
        const userRecord = res.find(
          (r) => r.employe._id.toString() === user._id.toString()
        );

        const record: AttendanceRecord = {
          employe: user,
          date: dateStr,
          statut: userRecord?.statut || "Absent",
          heureArrivee:
            userRecord?.heureArrivee && userRecord.heureArrivee !== "-"
              ? formatTime(userRecord.heureArrivee)
              : "-",
          heureDepart:
            userRecord?.heureDepart && userRecord.heureDepart !== "-"
              ? formatTime(userRecord.heureDepart)
              : "-",
          heuresTravaillees:
            userRecord?.heuresTravaillees && userRecord.heuresTravaillees !== "-"
              ? userRecord.heuresTravaillees
              : "0h",
          retard:
            userRecord?.retard && userRecord.retard !== "-"
              ? userRecord.retard
              : "-",
        };

        history.push(record);
      }

      setAttendanceHistory(history);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Erreur lors du chargement des présences");
    } finally {
      setLoading(false);
    }
  }, [user, days]);

  useEffect(() => {
    if (user?._id) fetchAttendanceHistory();
  }, [fetchAttendanceHistory, user]);

  // Formatage des dates
  const formatDateLabel = (dateStr: string) => {
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (dateStr === today) return "Aujourd'hui";
    if (dateStr === yesterdayStr) return "Hier";

    return new Date(dateStr).toLocaleDateString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // Obtenir la classe de couleur en fonction du statut
  const getStatusColor = (statut: string) => {
    switch (statut) {
      case "Présent":
        return "bg-green-100 text-green-800 border border-green-200";
      case "Absent":
        return "bg-red-100 text-red-800 border border-red-200";
      case "Retard":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "Congé":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "Télétravail":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Afficher un indicateur de chargement stylisé
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64 bg-gray-50 rounded-2xl animate-fade-in">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de vos présences...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 animate-fade-in">
        <div className="flex items-center">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <p>Veuillez vous connecter pour voir vos présences.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 animate-fade-in">
        <div className="flex items-center mb-3">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <p className="font-medium">{error}</p>
        </div>
        <button
          onClick={fetchAttendanceHistory}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-300 transform hover:-translate-y-1"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideIn {
          from { transform: translateX(-30px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes stagger {
          0% { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-slide-in {
          animation: slideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-scale-in {
          animation: scaleIn 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
        .animate-stagger > * {
          opacity: 0;
          animation: stagger 0.5s ease-out forwards;
        }
        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .stat-card {
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-2px) scale(1.02);
        }
      `}</style>

      {/* En-tête avec titre */}
      <div className="text-center mb-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mes Présences</h1>
        <p className="text-gray-600">Suivi de vos pointages sur les {days} derniers jours</p>
      </div>

      {/* Statistiques résumé */}
      {attendanceHistory.length > 0 && (
        <div className="bg-white rounded-2xl shadow-xl p-6 animate-scale-in">
          <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            Résumé
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-stagger">
            <div className="stat-card text-center p-4 bg-green-50 rounded-lg hover-lift">
              <div className="text-2xl font-bold text-green-600">
                {attendanceHistory.filter(r => r.statut === "Présent").length}
              </div>
              <div className="text-sm text-gray-600">Présences</div>
            </div>
            <div className="stat-card text-center p-4 bg-yellow-50 rounded-lg hover-lift">
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceHistory.filter(r => r.statut === "Retard").length}
              </div>
              <div className="text-sm text-gray-600">Retards</div>
            </div>
            <div className="stat-card text-center p-4 bg-red-50 rounded-lg hover-lift">
              <div className="text-2xl font-bold text-red-600">
                {attendanceHistory.filter(r => r.statut === "Absent").length}
              </div>
              <div className="text-sm text-gray-600">Absences</div>
            </div>
            <div className="stat-card text-center p-4 bg-blue-50 rounded-lg hover-lift">
              <div className="text-2xl font-bold text-blue-600">
                {attendanceHistory.filter(r => r.statut === "Congé").length}
              </div>
              <div className="text-sm text-gray-600">Congés</div>
            </div>
          </div>
        </div>
      )}

      {/* Version Desktop - Tableau */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden animate-scale-in">
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-xl font-semibold text-gray-800 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            Détail des présences
          </h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm font-medium">
                <th className="px-6 py-4 text-left">Date</th>
                <th className="px-6 py-4 text-center">Arrivée</th>
                <th className="px-6 py-4 text-center">Départ</th>
                <th className="px-6 py-4 text-center">Heures</th>
                <th className="px-6 py-4 text-center">Retard</th>
                <th className="px-6 py-4 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {attendanceHistory.map((record, index) => (
                <tr 
                  key={record.date} 
                  className="hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatDateLabel(record.date)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(record.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric"
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                    {record.heureArrivee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-mono text-gray-700">
                    {record.heureDepart}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-900">
                    {record.heuresTravaillees}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    {record.retard !== "-" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        {record.retard}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.statut)}`}>
                      {record.statut}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {attendanceHistory.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-500">Aucune donnée de présence disponible</p>
          </div>
        )}
      </div>

      {/* Version Mobile - Cartes */}
      <div className="lg:hidden space-y-4 animate-slide-in">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V极z" clipRule="evenodd" />
            </svg>
            Détail des présences
          </h3>

          {attendanceHistory.length === 0 ? (
            <div className="text-center py-8">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 极 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">Aucune donnée de présence disponible</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendanceHistory.map((record, index) => (
                <div 
                  key={record.date} 
                  className="bg-gray-50 rounded-xl p-4 hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-semibold text-gray-900">
                        {formatDateLabel(record.date)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(record.date).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric"
                        })}
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.statut)}`}>
                      {record.statut}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-600 text-xs">Arrivée</div>
                      <div className="font-mono text-gray-800">{record.heureArrivee}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Départ</div>
                      <div className="font-mono text-gray-800">{record.heureDepart}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Heures</div>
                      <div className="font-medium text-gray-800">{record.heuresTravaillees}</div>
                    </div>
                    <div>
                      <div className="text-gray-600 text-xs">Retard</div>
                      <div className="font-medium text-gray-800">
                        {record.retard !== "-" ? (
                          <span className="text-yellow-700">{record.retard}</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pied de page informatif */}
      <div className="text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <p className="text-gray-500 text-sm">
          Données mises à jour en temps réel • {new Date().toLocaleDateString('fr-FR')}
        </p>
      </div>
    </div>
  );
};