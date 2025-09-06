// const Performance = require('../Models/evaluationModel');
// const Utilisateur = require('../Models/usersModel');

// // 🔹 Ajouter une performance
// exports.ajouterPerformance = async (req, res) => {
//   try {
//     const { employe, objectif, description, realisation, evaluation } = req.body;

//     if (!employe || !objectif) {
//       return res.status(400).json({ message: "L'employé et l'objectif sont obligatoires." });
//     }

//     // Vérifier si l'employé existe
//     const employeExiste = await Utilisateur.findById(employe._id);
//     if (!employeExiste) {
//       return res.status(404).json({ message: "Employé non trouvé." });
//     }

//     const performance = await Performance.create({
//       employe: employe._id,
//       objectif,
//       description,
//       realisation,
//       evaluation
//     });

//     // Populer les données de l'employé pour la réponse
//     const performanceAvecEmploye = await Performance.findById(performance._id)
//       .populate('employe', 'matricule nom prenom poste departement');

//     res.status(201).json(performanceAvecEmploye);
//   } catch (err) {
//     res.status(500).json({ message: "Erreur serveur", error: err.message });
//   }
// };

// // 🔹 Lister toutes les performances
// exports.getAllPerformances = async (req, res) => {
//   try {
//     const performances = await Performance.find()
//       .populate('employe', 'matricule nom prenom poste departement')
//       .sort({ createdAt: -1 });

//     res.status(200).json(performances);
//   } catch (err) {
//     res.status(500).json({ message: "Erreur serveur", error: err.message });
//   }
// };

// // 🔹 Modifier une performance
// exports.updatePerformance = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { employe, objectif, description, realisation, evaluation } = req.body;

//     const performance = await Performance.findById(id);
//     if (!performance) return res.status(404).json({ message: "Performance non trouvée." });

//     if (employe) performance.employe = employe._id;
//     if (objectif) performance.objectif = objectif;
//     if (description) performance.description = description;
//     if (realisation) performance.realisation = realisation;
//     if (evaluation) performance.evaluation = evaluation;

//     await performance.save();

//     // Récupérer la performance mise à jour avec les données de l'employé
//     const performanceMiseAJour = await Performance.findById(id)
//       .populate('employe', 'matricule nom prenom poste departement');

//     res.status(200).json(performanceMiseAJour);
//   } catch (err) {
//     res.status(500).json({ message: "Erreur serveur", error: err.message });
//   }
// };

// // 🔹 Supprimer une performance
// exports.deletePerformance = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const performance = await Performance.findByIdAndDelete(id);

//     if (!performance) return res.status(404).json({ message: "Performance non trouvée." });

//     res.status(200).json({ message: "Performance supprimée avec succès." });
//   } catch (err) {
//     res.status(500).json({ message: "Erreur serveur", error: err.message });
//   }
// };

const Performance = require('../Models/evaluationModel');
const Utilisateur = require('../Models/usersModel');

// 🔹 Ajouter une performance
exports.ajouterPerformance = async (req, res) => {
  try {
    const { employe, objectif, description, realisation, evaluation } = req.body;

    if (!employe || !objectif) {
      return res.status(400).json({ message: "L'employé et l'objectif sont obligatoires." });
    }

    // Trouver l'employé par son ID
    const employeTrouve = await Utilisateur.findById(employe._id);
    if (!employeTrouve) {
      return res.status(404).json({ message: "Employé non trouvé." });
    }

    const performance = await Performance.create({
      employe: employeTrouve._id,
      objectif,
      description,
      realisation,
      evaluation
    });

    // Populer les données de l'employé pour la réponse
    const performanceAvecEmploye = await Performance.findById(performance._id)
      .populate('employe', 'matricule nom prenom poste departement');

    res.status(201).json(performanceAvecEmploye);
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

    if (employe) {
      const employeTrouve = await Utilisateur.findById(employe._id);
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

    // Récupérer la performance mise à jour avec les données de l'employé
    const performanceMiseAJour = await Performance.findById(id)
      .populate('employe', 'matricule nom prenom poste departement');

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