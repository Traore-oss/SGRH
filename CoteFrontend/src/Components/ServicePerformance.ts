import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

// =======================
// Interfaces
// =======================
export interface Departement {
  _id: string;
  nom: string;
  code_departement: string;
}

export interface Employee {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'Admin' | 'RH' | 'Employe';
  isActive: boolean;
  matricule?: string;
  poste?: string;
  departement?: Departement;
}

export interface Performance {
  _id?: string;
  employe: string | Employee;
  objectif: string;
  description: string;
  realisation: 'Non démarré' | 'En cours' | 'Terminé';
  evaluation: 'Excellent' | 'Bon' | 'Moyen' | 'Insuffisant';
  createdAt?: string;
  updatedAt?: string;
}

// =======================
// Formations / Participants
// =======================
export interface Formation {
  _id?: string;
  titre: string;
  description: string;
  formateur: string;
  dateDebut: string;
  dateFin: string;
  duree: number;
  lieu: string;
  typeFormation: string;
  statut: 'planifié' | 'en_cours' | 'terminé' | 'annulé';
  cout: number;
  participants: string[];
  objectifs: string[];
  prerequis: string[];
  materiel: string;
  evaluation: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ParticipantFormation {
  _id: string;
  employe: {
    _id: string;
    nom: string;
    prenom: string;
    matricule: string;
    poste: string;
    departement?: { nom: string };
  };
  formation: string;
  statut: 'inscrit' | 'présent' | 'absent' | 'en_attente';
  evaluation: number;
  commentaires: string;
  dateInscription: string;
}

// =======================
// Performances CRUD
// =======================
export const updatePerformance = async (
  id: string,
  perf: Omit<Performance, 'createdAt' | 'updatedAt'>
): Promise<Performance> => {
  const performanceData = {
    ...perf,
    employe: typeof perf.employe === 'object' ? perf.employe._id : perf.employe
  };

  const response = await fetch(`${API_BASE}/api/performances/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(performanceData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erreur lors de la modification de la performance');
  }

  return response.json();
};
// Formations CRUD
// =======================
export const getFormations = async (): Promise<Formation[]> => {
  const res = await axios.get(`${API_BASE}/api/formations`, { withCredentials: true });
  return res.data;
};

export const getFormationById = async (id: string): Promise<Formation> => {
  const res = await axios.get(`${API_BASE}/api/formations/${id}`, { withCredentials: true });
  return res.data;
};

export const createFormation = async (formation: Omit<Formation, '_id'>): Promise<Formation> => {
  const res = await axios.post(`${API_BASE}/api/formations`, formation, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const updateFormation = async (id: string, formation: Partial<Formation>): Promise<Formation> => {
  const res = await axios.put(`${API_BASE}/api/formations/${id}`, formation, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const deleteFormation = async (id: string): Promise<void> => {
  await axios.delete(`${API_BASE}/api/formations/${id}`, { withCredentials: true });
};

// =======================
// Participants
// =======================
export const inscrireParticipant = async (formationId: string, employeId: string): Promise<ParticipantFormation> => {
  const res = await axios.post(`${API_BASE}/api/formations/${formationId}/participants`, { employeId }, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const updateStatutParticipant = async (
  formationId: string,
  participantId: string,
  statut: ParticipantFormation['statut'],
  evaluation?: number,
  commentaires?: string
): Promise<ParticipantFormation> => {
  const res = await axios.put(`${API_BASE}/api/formations/${formationId}/participants/${participantId}`, {
    statut,
    evaluation,
    commentaires
  }, {
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' }
  });
  return res.data;
};

export const getParticipantsFormation = async (formationId: string): Promise<ParticipantFormation[]> => {
  const res = await axios.get(`${API_BASE}/api/formations/${formationId}/participants`, { withCredentials: true });
  return res.data;
};

export const getFormationsByEmploye = async (employeId: string): Promise<ParticipantFormation[]> => {
  const res = await axios.get(`${API_BASE}/api/formations/employe/${employeId}`, { withCredentials: true });
  return res.data;
};
