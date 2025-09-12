import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";
// Dans ServiceEmployer.ts ou un fichier de types partagé
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
  password?: string; // Ne devrait pas être envoyé au frontend idéalement
  genre: 'Homme' | 'Femme' | 'Autre';
  date_naissance?: string; // Ou Date
  telephone?: string;
  adresse?: string;
  photo?: string;
  role: 'Admin' | 'RH' | 'Employe';
  isActive: boolean;
  // Champs spécifiques à l'employé
  matricule?: string;
  poste?: string;
  salaire?: number;
  typeContrat?: 'CDI' | 'CDD' | 'Stage' | 'Freelance';
  statut?: 'Actif' | 'Inactif' | 'Congé' | 'Suspendu';
  departement?: Departement; // Ou juste l'ID si pas peuplé
  numeroCNSS?: string;
  numeroCIN?: string;
  banque?: string;
  numeroCompte?: string;
  date_embauche?: string; // Ou Date
  joursCongesRestants?: number;
  derniereEvaluation?: string; // Ou Date
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

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
    departement?: {
      nom: string;
    };
  };
  formation: string;
  statut: 'inscrit' | 'présent' | 'absent' | 'en_attente';
  evaluation: number;
  commentaires: string;
  dateInscription: string;
}

// Récupérer toutes les formations
export const getFormations = async (): Promise<Formation[]> => {
  try {
    const response = await axios.get(`${API_BASE}/api/formations`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des formations:', error);
    throw new Error('Impossible de charger les formations');
  }
};

// Récupérer une formation par ID
export const getFormationById = async (id: string): Promise<Formation> => {
  try {
    const response = await axios.get(`${API_BASE}/api/formations/${id}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de la formation:', error);
    throw new Error('Formation non trouvée');
  }
};

// Créer une nouvelle formation
export const createFormation = async (formation: Omit<Formation, '_id'>): Promise<Formation> => {
  try {
    const response = await axios.post(`${API_BASE}/api/formations`, formation, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la formation:', error);
    throw new Error('Impossible de créer la formation');
  }
};

// Mettre à jour une formation
export const updateFormation = async (id: string, formation: Partial<Formation>): Promise<Formation> => {
  try {
    const response = await axios.put(`${API_BASE}/api/formations/${id}`, formation, {
      withCredentials: true,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la formation:', error);
    throw new Error('Impossible de mettre à jour la formation');
  }
};

// Supprimer une formation
export const deleteFormation = async (id: string): Promise<void> => {
  try {
    await axios.delete(`${API_BASE}/api/formations/${id}`, {
      withCredentials: true,
    });
  } catch (error) {
    console.error('Erreur lors de la suppression de la formation:', error);
    throw new Error('Impossible de supprimer la formation');
  }
};

// Inscrire un participant à une formation
export const inscrireParticipant = async (formationId: string, employeId: string): Promise<ParticipantFormation> => {
  try {
    const response = await axios.post(
      `${API_BASE}/api/formations/${formationId}/participants`,
      { employeId },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'inscription du participant:', error);
    throw new Error('Impossible d\'inscrire le participant');
  }
};

// Mettre à jour le statut d'un participant
export const updateStatutParticipant = async (
  formationId: string,
  participantId: string,
  statut: string,
  evaluation?: number,
  commentaires?: string
): Promise<ParticipantFormation> => {
  try {
    const response = await axios.put(
      `${API_BASE}/api/formations/${formationId}/participants/${participantId}`,
      { statut, evaluation, commentaires },
      {
        withCredentials: true,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du participant:', error);
    throw new Error('Impossible de mettre à jour le participant');
  }
};

// Récupérer les participants d'une formation
export const getParticipantsFormation = async (formationId: string): Promise<ParticipantFormation[]> => {
  try {
    const response = await axios.get(`${API_BASE}/api/formations/${formationId}/participants`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des participants:', error);
    throw new Error('Impossible de charger les participants');
  }
};

// Récupérer les formations d'un employé
export const getFormationsByEmploye = async (employeId: string): Promise<ParticipantFormation[]> => {
  try {
    const response = await axios.get(`${API_BASE}/api/formations/employe/${employeId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des formations de l\'employé:', error);
    throw new Error('Impossible de charger les formations de l\'employé');
  }
};