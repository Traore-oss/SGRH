const Performance = require('../Models/evaluationModel');
const Utilisateur = require('../Models/usersModel');

// 🔹 Ajouter une performance
exports.ajouterPerformance = async (req, res) => {
  try {
    const { matricule, objectif, description, realisation, evaluation } = req.body;

    if (!matricule || !objectif) {
      return res.status(400).json({ message: "Le matricule et l'objectif sont obligatoires." });
    }

    // 🔹 Trouver l'employé par matricule dans le sous-document employer
    const employeTrouve = await Utilisateur.findOne({ "employer.matricule": matricule });
    if (!employeTrouve) {
      return res.status(404).json({ message: "Aucun employé trouvé avec ce matricule" });
    }

    const performance = await Performance.create({
      employe: employeTrouve._id,
      objectif,
      description,
      realisation,
      evaluation
    });

    // 🔹 Populer les données de l'employé pour la réponse
    const performanceAvecEmploye = await Performance.findById(performance._id)
      .populate({
        path: 'employe',
        select: 'employer.nom employer.prenom employer.matricule employer.poste employer.departement',
      });

    res.status(201).json(performanceAvecEmploye);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Lister toutes les performances
exports.getAllPerformances = async (req, res) => {
  try {
    const performances = await Performance.find()
      .populate({
        path: 'employe',
        select: 'employer.nom employer.prenom employer.matricule employer.poste employer.departement',
      })
      .sort({ createdAt: -1 });

    res.status(200).json(performances);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// 🔹 Modifier une performance
exports.updatePerformance = async (req, res) => {
  try {
    const { id } = req.params;
    const { employe, objectif, description, realisation, evaluation } = req.body;

    const performance = await Performance.findById(id);
    if (!performance) return res.status(404).json({ message: "Performance non trouvée." });

    // 🔹 Mettre à jour l'employé si fourni
    if (employe && employe.matricule) {
      const employeTrouve = await Utilisateur.findOne({ "employer.matricule": employe.matricule });
      if (!employeTrouve) {
        return res.status(404).json({ message: "Employé non trouvé." });
      }
      performance.employe = employeTrouve._id;
    }

    if (objectif) performance.objectif = objectif;
    if (description) performance.description = description;
    if (realisation) performance.realisation = realisation;
    if (evaluation) performance.evaluation = evaluation;

    await performance.save();

    // 🔹 Récupérer la performance mise à jour avec les données de l'employé
    const performanceMiseAJour = await Performance.findById(id)
      .populate({
        path: 'employe',
        select: 'employer.nom employer.prenom employer.matricule employer.poste employer.departement',
      });

    res.status(200).json(performanceMiseAJour);
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
