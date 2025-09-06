// import type { Employee } from './ServiceEmployer';
import api from '../api/axios.config';
import type { Employee } from './ServiceEmployer';

export interface Performance {
  _id?: string;
  employe: Employee;
  objectif: string;
  description: string;
  realisation: string;
  evaluation: string;
}

// Récupérer toutes les performances
export const getPerformances = async (): Promise<Performance[]> => {
  try {
    console.log('Fetching performances from API...');
    const res = await api.get('/api/performances');
    console.log('API response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des performances:', error);
    throw new Error('Impossible de charger les performances');
  }
};

// Ajouter une performance
export const addPerformance = async (perf: Omit<Performance, '_id'>) => {
  try {
    console.log('Adding performance:', perf);
    const res = await api.post('/api/performances', perf);
    console.log('Add performance response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Erreur lors de l\'ajout de la performance:', error);
    throw new Error('Impossible d\'ajouter la performance');
  }
};

// Modifier une performance
export const updatePerformance = async (id: string, perf: Performance) => {
  try {
    console.log('Updating performance:', id, perf);
    const res = await api.put(`/api/performances/${id}`, perf);
    console.log('Update performance response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Erreur lors de la modification de la performance:', error);
    throw new Error('Impossible de modifier la performance');
  }
};

// Supprimer une performance
export const deletePerformance = async (id: string) => {
  try {
    console.log('Deleting performance:', id);
    const res = await api.delete(`/api/performances/${id}`);
    console.log('Delete performance response:', res.data);
    return res.data;
  } catch (error) {
    console.error('Erreur lors de la suppression de la performance:', error);
    throw new Error('Impossible de supprimer la performance');
  }
};