const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface Departement {
  _id: string;
  nom: string;
  code_departement: string;
}

export interface Employee {
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
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  role: string;
  statut: 'Actif' | 'Inactif' | 'Suspendu';
  isActive: boolean;
  date_embauche: string;
  photo?: string;
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
  typeContrat: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  roleType: string;
  statut: 'Actif' | 'Inactif' | 'Suspendu';
  photo?: File;
}

export const getEmployees = async (): Promise<Employee[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/getAllEmployees`, {
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des employés');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching employees:', error);
    throw error;
  }
};

export const createEmployee = async (formData: FormData): Promise<Employee> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/creerEmployer`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la création');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating employee:', error);
    throw error;
  }
};

export const updateEmployee = async (id: string, formData: FormData): Promise<Employee> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/updateEmployee/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erreur lors de la mise à jour');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error updating employee:', error);
    throw error;
  }
};

export const activateEmployee = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/activateEmployee/${id}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de l\'activation');
    }
  } catch (error) {
    console.error('Error activating employee:', error);
    throw error;
  }
};

export const deactivateEmployee = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE}/api/Users/deactivateEmployee/${id}`, {
      method: 'PATCH',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Erreur lors de la désactivation');
    }
  } catch (error) {
    console.error('Error deactivating employee:', error);
    throw error;
  }
};