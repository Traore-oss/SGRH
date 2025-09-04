const Performance = require('../Models/evaluationModel');
const Utilisateur = require('../Models/usersModel');

// 🔹 Ajouter une performance
exports.ajouterPerformance = async (req, res) => {
  try {
    const { matricule, objectif, description, realisation, evaluation } = req.body;

    if (!matricule || !objectif) {
      return res.status(400).json({ message: "Le matricule et l'objectif sont obligatoires." });
    }

    // Vérifier si l'employé existe par matricule
    const employe = await Utilisateur.findOne({ matricule });
    if (!employe) {
      return res.status(404).json({ message: "Employé non trouvé." });
    }

    const performance = await Performance.create({
      employe: employe._id, // stocke l'ID MongoDB
      objectif,
      description,
      realisation,
      evaluation
    });

    res.status(201).json({ message: "Performance ajoutée avec succès.", performance });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Lister toutes les performances
exports.getAllPerformances = async (req, res) => {
  try {
    const performances = await Performance.find()
      .populate('employe', 'matricule nom prenom poste departement')
      .sort({ createdAt: -1 });

    res.status(200).json({ performances });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Modifier une performance
exports.updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { objectif, description, realisation, evaluation } = req.body;

    const performance = await Performance.findById(id);
    if (!performance) return res.status(404).json({ message: "Performance non trouvée." });

    if (objectif) performance.objectif = objectif;
    if (description) performance.description = description;
    if (realisation) performance.realisation = realisation;
    if (evaluation) performance.evaluation = evaluation;

    await performance.save();

    res.status(200).json({ message: "Performance mise à jour avec succès.", performance });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Supprimer une performance
exports.deletePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const performance = await Performance.findByIdAndDelete(id);

    if (!performance) return res.status(404).json({ message: "Performance non trouvée." });

    res.status(200).json({ message: "Performance supprimée avec succès." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
