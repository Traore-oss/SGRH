// controllers/salaireController.js
const Salaire = require('../Models/SalaireModel');

exports.calculerSalaire = async (req, res) => {
  try {
    const {
      nom,
      salaireJournalier,
      joursTravailles,
      primes = 0,
      retenues = 0,
      absences = 0,
      heuresSup = 0,
    } = req.body;

    if (!nom || !salaireJournalier || !joursTravailles) {
      return res.status(400).json({ message: "Les champs nom, salaireJournalier et joursTravailles sont obligatoires." });
    }

    // Calcul du salaire net
    const tauxHoraire = salaireJournalier / 8;
    const salaireBase = salaireJournalier * (joursTravailles - absences);
    const salaireHeuresSup = heuresSup * tauxHoraire;
    const salaireNet = salaireBase + salaireHeuresSup + primes - retenues;

    const salaire = new Salaire({
      nom,
      salaireJournalier,
      joursTravailles,
      primes,
      retenues,
      absences,
      heuresSup,
      salaireNet,
    });

    await salaire.save();

    res.status(200).send({
      message: "Salaire calculé et enregistré avec succès",
      salaire
    });
  } catch (error) {
    console.error("Erreur dans calculerSalaire:", error);
    res.status(500).send({ message: "Erreur serveur" });
  }
};

exports.getAllSalaires = async (req, res) => {
  try {
    const salaires = await Salaire.find().sort({ date: -1 });
    res.status(200).send(salaires);
  } catch (error) {
    console.error("Erreur dans l'affichages:", error);
    res.status(500).send({ message: "Erreur serveur dans l'affichage" });
  }
};
