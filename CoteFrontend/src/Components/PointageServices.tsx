/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export interface Employee {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
}

export interface AttendanceRecord {
  employe: Employee;
  date: string;
  statut: "Présent" | "Absent";
  heureArrivee: string;
  heureDepart: string;
  heuresTravaillees: string;
  retard?: string;
}

const API_BASE = "http://localhost:8000/api/pointages";

// 🔹 Récupère le token centralisé
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// 🔹 Récupérer les présences par date
export const getAttendancesByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const res = await axios.get(`${API_BASE}/`, {
      params: { date },
      headers: getAuthHeaders(),
      withCredentials: true,
    });
    return res.data || [];
  } catch (error: any) {
    console.error("Erreur getAttendancesByDate:", error.response?.data || error.message);
    return [];
  }
};

// 🔹 Marquer l’arrivée de plusieurs employés
export const updatePresenceBulk = async (
  records: { employeId: string; date: string; checked: boolean }[]
): Promise<boolean> => {
  try {
    console.log("➡️ Envoi updatePresenceBulk:", records);
    const res = await axios.put(
      `${API_BASE}/updatePresence`,
      { attendances: records },
      {
        headers: getAuthHeaders(),
        withCredentials: true,
      }
    );
    console.log("✅ Réponse updatePresenceBulk:", res.data);
    return res.status === 200;
  } catch (error: any) {
    console.error("❌ Erreur updatePresenceBulk:", error.response?.data || error.message);
    return false;
  }
};

// 🔹 Marquer le départ
export const setDeparture = async (userId: string, date: string): Promise<boolean> => {
  try {
    const res = await axios.post(
      `${API_BASE}/setDeparture`,
      { userId, date },
      {
        headers: getAuthHeaders(),
        withCredentials: true,
      }
    );
    return res.status === 200;
  } catch (error: any) {
    console.error("Erreur setDeparture:", error.response?.data || error.message);
    return false;
  }
};
// 🔹 Nouvelle fonction pour récupérer tous les pointages d’un mois
export const getAttendancesByMonth = async (year: string, month: string) => {
  try {
    const startDate = `${year}-${month}-01`;
    const endDate = `${year}-${month}-31`;
    const res = await axios.get(`${API_BASE}/`, {
      params: { startDate, endDate },
      headers: getAuthHeaders(),
      withCredentials: true,
    });
    return res.data || [];
  } catch (error: any) {
    console.error("Erreur getAttendancesByMonth:", error.response?.data || error.message);
    return [];
  }
};