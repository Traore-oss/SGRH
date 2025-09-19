
/* eslint-disable @typescript-eslint/no-explicit-any */
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Departement {
  _id: string;
  nom: string;
  code_departement: string;
}

export interface Employee {
  _id: string;
  matricule?: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  codePostal?: string;
  genre?: string;
  date_naissance?: string;
  poste?: string;
  departement?: Departement;
  salaire?: number;
  typeContrat?: "CDI" | "CDD" | "Stage" | "Freelance";
  role: string;
  statut?: "Actif" | "Inactif" | "Suspendu";
  isActive: boolean;
  date_embauche?: string;
  photo?: string;
  notes?: string;
  derniereEvaluation?: string;
  joursCongesRestants?: string;
  statutMarital?: string;
  banque?: string;
  numeroCompte?: string;
  personneContact?: string;
  telephoneUrgence?: string;
  numeroCIN?: string;
  numeroCNSS?: string;
  employer?: any; // sous-document employé
}

export interface ToggleResponse {
  message: string;
  utilisateur: Employee;
}

// Tous les employés
export const getEmployees = async (): Promise<Employee[]> => {
  const res = await fetch(`${API_BASE}/api/users/`, { credentials: "include" });
  if (!res.ok) throw new Error("Erreur lors de la récupération des employés");
  return await res.json();
};

// Employé par ID
export const getEmployeeById = async (id: string): Promise<Employee> => {
  const res = await fetch(`${API_BASE}/api/users/${id}`, { credentials: "include" });
  if (!res.ok) throw new Error("Employé non trouvé");
  return await res.json();
};

// Créer un employé
export const createEmployee = async (formData: FormData): Promise<Employee> => {
  const res = await fetch(`${API_BASE}/api/users/`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Erreur création employé");
  return await res.json();
};

// Mettre à jour un employé
export const updateEmployee = async (id: string, formData: FormData): Promise<Employee> => {
  const res = await fetch(`${API_BASE}/api/users/${id}`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) throw new Error("Erreur mise à jour employé");
  return await res.json();
};

// Activer / désactiver un employé
export const toggleEmployeeActive = async (id: string): Promise<ToggleResponse> => {
  const res = await fetch(`${API_BASE}/api/auth/toggle-active/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
  });

  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Erreur toggle employé");
  }

  const data: ToggleResponse = await res.json();
  return data;
};





export interface EmployeeStats {
  leaves: {
    approved: number;
    rejected: number;
    pending: number;
    total: number;
  };
  attendance: {
    presence: number;
    absence: number;
    delay: number;
  };
  performance: {
    ponctuality: number;
    efficiency: number;
    productivity: number;
    engagement: number;
    global: number;
  };
}

// Statistiques d'un employé
export const getEmployeeStats = async (id: string): Promise<EmployeeStats> => {
  const res = await fetch(`${API_BASE}/api/users/stats/${id}`, {
    credentials: "include"
  });
  if (!res.ok) {
    const errData = await res.json();
    throw new Error(errData.message || "Erreur récupération stats");
  }
  return await res.json();
};


