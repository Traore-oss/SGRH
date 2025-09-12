// services/employeeService.ts
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Departement {
  _id: string;
  nom: string;
  code_departement: string;
}

export interface Employee {
  employer: any;
  notes?: string;
  derniereEvaluation?: string;
  joursCongesRestants?: string;
  codePostal?: string;
  statutMarital?: string;
  banque?: string;
  numeroCompte?: string;
  personneContact?: string;
  telephoneUrgence?: string;
  numeroCIN?: string;
  numeroCNSS?: string;
  _id: string;
  matricule: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  genre: string;
  date_naissance: string;
  poste: string;
  departement?: Departement;
  salaire: number;
  typeContrat: "CDI" | "CDD" | "Stage" | "Freelance";
  role: string;
  statut: "Actif" | "Inactif" | "Suspendu";
  isActive: boolean;
  date_embauche: string;
  photo?: string;
  ville?: string;
}

export interface EmployeeFormData {
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  genre: string;
  date_naissance: string;
  poste: string;
  code_departement?: string;
  salaire: number;
  typeContrat: "CDI" | "CDD" | "Stage" | "Freelance";
  roleType: string;
  statut: "Actif" | "Inactif" | "Suspendu";
  photo?: File;
  ville?: string;
  codePostal?: string;
  statutMarital?: string;
  numeroCNSS?: string;
  numeroCIN?: string;
  banque?: string;
  numeroCompte?: string;
  personneContact?: string;
  telephoneUrgence?: string;
}

// Récupérer tous les employés
export const getEmployees = async (): Promise<Employee[]> => {
  try {
    console.log("Fetching employees from:", `${API_BASE}/api/Users/`);
    
    const response = await fetch(`${API_BASE}/api/Users/`, {
      credentials: "include",
    }); 

    console.log("Response status:", response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error:", errorData);
      throw new Error(
        errorData.error || "Erreur lors de la récupération des employés"
      );
    }

    const data = await response.json();
    console.log("API Response data:", data);
    
    // Si la réponse est un objet avec employees, retourne le tableau
    if (Array.isArray(data)) {
      console.log("Employees array received:", data.length, "employees");
      return data;
    }
    if (Array.isArray(data.employees)) {
      console.log("Employees array received in data.employees:", data.employees.length, "employees");
      return data.employees;
    }
    if (Array.isArray(data.users)) {
      console.log("Employees array received in data.users:", data.users.length, "employees");
      return data.users;
    }
    
    console.warn("Unexpected API response format:", data);
    return [];
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw new Error(
      error instanceof Error ? error.message : "Erreur de connexion au serveur"
    );
  }
};

// Activer / désactiver un employé

interface EmployeeType {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  isActive: boolean;
  // ajoute d'autres champs si nécessaire
}

// 🔹 Activer / désactiver
export const toggleEmployeeActive = async (id: string, isActive: boolean) => {
  const res = await fetch(`${API_BASE}/Auth/toggleActive/${id}`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive }),
  });
  if (!res.ok) throw new Error("Erreur toggle employé");
  return await res.json();
};
// Récupérer un employé par ID
export const getEmployeeById = async (id: string): Promise<Employee> => {
  try {
    const res = await fetch(`${API_BASE}/Users/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Employé non trouvé");
    return await res.json();
  } catch (err) {
    console.error("Erreur getEmployeeById:", err);
    throw err;
  }
};

// Créer un employé
export const createEmployee = async (formData: FormData): Promise<Employee> => {
  try {
    const res = await fetch(`${API_BASE}/Users/`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Erreur lors de la création de l'employé");
    return await res.json();
  } catch (err) {
    console.error("Erreur createEmployee:", err);
    throw err;
  }
};

// Mettre à jour un employé
export const updateEmployee = async (id: string, formData: FormData): Promise<Employee> => {
  try {
    const res = await fetch(`${API_BASE}/Users/${id}`, {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
    if (!res.ok) throw new Error("Erreur lors de la mise à jour de l'employé");
    return await res.json();
  } catch (err) {
    console.error("Erreur updateEmployee:", err);
    throw err;
  }
};

export const getEmployeeDetailsById = async (
  id: string
): Promise<Employee> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/${id}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Employé non trouvé");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching employee details:", error);
    throw new Error(
      error instanceof Error ? error.message : "Erreur de récupération des détails"
    );
  }
};