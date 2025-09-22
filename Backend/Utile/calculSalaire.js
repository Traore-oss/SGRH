// utils/calculSalaire.js
function calculerSalaireNet(salaireBase, primes, heuresSup, retenues, absences) {
  const montantHeuresSup = heuresSup * 5000; // ex: 5000 GNF / heure
  const montantAbsences = absences * (salaireBase / 30); // calcul au prorata
  return salaireBase + primes + montantHeuresSup - retenues - montantAbsences;
}

module.exports = { calculerSalaireNet };
