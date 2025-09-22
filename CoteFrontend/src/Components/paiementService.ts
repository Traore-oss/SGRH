/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const API_SALAIRES =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/salaires";
const API_EMPLOYES =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/users";

const token = localStorage.getItem("token");

const config = {
  headers: { Authorization: `Bearer ${token}` },
  withCredentials: true,
};

// 🔹 Récupérer tous les paiements
export const getPaiements = async () => {
  const res = await axios.get(API_SALAIRES, config);
  return res.data;
};

// 🔹 Créer un paiement
export const createPaiement = async (paiement: any) => {
  const res = await axios.post(API_SALAIRES, paiement, config);
  return res.data;
};

// 🔹 Mettre à jour un paiement
export const updatePaiement = async (id: string, paiement: any) => {
  const res = await axios.put(`${API_SALAIRES}/${id}`, paiement, config);
  return res.data;
};

// 🔹 Supprimer un paiement
export const deletePaiement = async (id: string) => {
  const res = await axios.delete(`${API_SALAIRES}/${id}`, config);
  return res.data;
};

// 🔹 Recherche employé par matricule
export const findEmployeByMatricule = async (matricule: string) => {
  const res = await axios.get(`${API_EMPLOYES}?matricule=${matricule}`, config);
  return res.data;
};
