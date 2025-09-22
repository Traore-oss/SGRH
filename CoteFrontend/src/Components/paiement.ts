export interface Paiement {
  _id: string;
  employe: {
    nom: string;
    prenom: string;
    email?: string;
  };
  mois: string;
  salaireBase: number;
  primes: number;
  heuresSupplementaires: number;
  retenues: number;
  absences: number;
  salaireNet: number;
  modePaiement: string;
  remarque?: string;
  datePaiement: string;
}
