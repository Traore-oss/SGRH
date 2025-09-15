/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

export interface Employee {
  id?: string; // optionnel car parfois c’est _id qui vient de MongoDB
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

// 🔹 Récupérer les présences par date
export const getAttendancesByDate = async (date: string): Promise<AttendanceRecord[]> => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.get(`${API_BASE}/getAttendances`, {
      params: { date },
      headers: {
        Authorization: token ? `Bearer ${token}` : "",
      },
      withCredentials: true, // permet aussi d'envoyer les cookies si nécessaire
    });

    return res.data || [];
  } catch (error: any) {
    console.error("Erreur getAttendancesByDate:", error.response?.data || error.message);
    return [];
  }
};
// 🔹 Marquer l’arrivée de plusieurs employés en une seule requête
export const updatePresenceBulk = async (
  records: { employeId: string; date: string; checked: boolean }[]
): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");

    // 👀 Log côté frontend avant l’envoi
    console.log("➡️ Envoi updatePresenceBulk:", records);

    const res = await axios.put(
      `${API_BASE}/updatePresence`, // endpoint backend
      { attendances: records },     // le backend attend { attendances: [...] }
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true,
      }
    );

    // 👀 Log côté frontend après la réponse
    console.log("✅ Réponse updatePresenceBulk:", res.data);

    return res.status === 200;
  } catch (error: any) {
    console.error(
      "❌ Erreur updatePresenceBulk:",
      error.response?.data || error.message
    );
    return false;
  }
};


// 🔹 Marquer le départ
export const setDeparture = async (userId: string, date: string): Promise<boolean> => {
  try {
    const token = localStorage.getItem("token");

    const res = await axios.post(
      `${API_BASE}/setDeparture`,
      { userId, date },
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
        withCredentials: true,
      }
    );

    return res.status === 200;
  } catch (error: any) {
    console.error("Erreur setDeparture:", error.response?.data || error.message);
    return false;
  }
};
