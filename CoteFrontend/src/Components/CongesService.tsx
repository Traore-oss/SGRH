import axios from "axios";

const API_BASE = "http://localhost:8000/api"; // adapte si ton backend est ailleurs

// Types
export interface Employee {
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

export interface Conge {
  _id: string;
  employe: Employee | string;
  dateDebut: string;
  dateFin: string;
  typeConge: string;
  nbJours: number;
  motif?: string;
  etat: "en attente" | "approuvé" | "refusé";
  commentaireResponsable?: string;
  dateSoumission: string;
  dateValidation?: string;
}

// 🔹 Récupérer tous les employés
export const getEmployees = async (): Promise<Employee[]> => {
  const res = await axios.get(`${API_BASE}/users`, { withCredentials: true });
  return res.data;
};

// 🔹 Récupérer toutes les demandes de congé
export const getDemandesConge = async (): Promise<Conge[]> => {
  const res = await axios.get(`${API_BASE}/conges/getAllConges`, { withCredentials: true });
  return res.data;
};

// 🔹 Créer une demande de congé
export const creerConge = async (data: {
  employeId: string;
  typeConge: string;
  dateDebut: string;
  dateFin: string;
  raison: string;
}) => {
  const res = await axios.post(`${API_BASE}/conges/creerConge`, data, { withCredentials: true });
  return res.data;
};

// 🔹 Approuver une demande
export const approuverConge = async (id: string) => {
  const res = await axios.put(`${API_BASE}/conges/approuverConge/${id}`, {}, { withCredentials: true });
  return res.data;
};

// 🔹 Refuser une demande
export const refuserConge = async (id: string) => {
  const res = await axios.put(`${API_BASE}/conges/refuserConge/${id}`, {}, { withCredentials: true });
  return res.data;
};
